// src/pages/ComplianceReview.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Card, Table, Tag, Button, Space, Typography, Alert, message, Modal,
  Input, Skeleton, Empty, Badge,
} from "antd";
import {
  SafetyOutlined, WarningOutlined, CheckCircleOutlined, EyeOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

function fmtDate(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return "-"; }
}

function controlListLabel(code) {
  switch (code) {
    case "gel":       return "GEL (Sanctions)";
    case "ppe_nat":   return "PPE Nationale";
    case "ppe_inter": return "PPE Internationale";
    default:          return code || "-";
  }
}

const ComplianceReview = () => {
  const navigate = useNavigate();
  const [loading, setLoading]     = useState(true);
  const [contracts, setContracts] = useState([]);
  const [approveModal, setApproveModal] = useState(null); // { contract, notes }
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const userId = decoded?.userId || decoded?._id || decoded?.id;
  const userRoleRaw = decoded?.role || decoded?.userType || "";
  const userRole = String(userRoleRaw).toLowerCase(); // "admin" | "manager" | "commercial"

  // Should never happen because sidebar hides this page, but defensive.
  if (!["admin", "manager"].includes(userRole)) {
    return (
      <div className="p-8">
        <Alert
          type="error" showIcon
          message="Accès refusé"
          description="Seuls les administrateurs et les managers peuvent accéder à cette page."
        />
      </div>
    );
  }

  // const fetchPending = async () => {
  //   setLoading(true);
  //   try {
  //     const { data } = await axios.get("/contrats/pending-review");
  //     setContracts(data.data || []);
  //   } catch (err) {
  //     console.error("[ComplianceReview] fetch error:", err);
  //     message.error("Impossible de charger les contrats en attente");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchPending = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
  
      // 1. Fetch the full unfiltered list (same shape as /sinistres in Sinistres.jsx)
      const { data } = await axios.get("/contrats/pending-review");
      const allContracts = data.data || [];
  
      // 2. Decode the JWT to know the caller
      const decoded = token ? jwtDecode(token) : null;
      const userRole = String(decoded?.role || "").toLowerCase();
      const currentUserId = decoded?.userId?.toString();
  
      // 3. Admin sees everything — no filtering
      if (userRole === "admin") {
        setContracts(allContracts);
        return;
      }
  
      // 4. Manager: only contracts whose lead is assigned to them or to one of their commercials
      if (userRole === "manager") {
        try {
          // Fetch the manager's team of commercials (same endpoint used elsewhere in the CRM)
          const commercialsRes = await axios.get("/commercials", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const commercials = commercialsRes.data || [];
  
          // Build the team's user IDs — self + all commercials reporting to this manager
          const teamIds = new Set([currentUserId]);
          commercials.forEach((c) => {
            const managerRef =
              c.manager?.toString() || c.createdBy?.toString();
            if (managerRef === currentUserId) {
              teamIds.add(c._id?.toString());
            }
          });
  
          // Keep only contracts whose lead is assigned to this team
          const filtered = allContracts.filter((c) => {
            const lead = c.lead || {};
            const g = lead.gestionnaire?.toString();
            const cm = lead.commercial?.toString();
            const m = lead.manager?.toString();
            return teamIds.has(g) || teamIds.has(cm) || teamIds.has(m);
          });
  
          setContracts(filtered);
        } catch (e) {
          console.error("[ComplianceReview] team filter error:", e);
          // Fallback: if the commercials fetch fails, don't hide everything
          setContracts(allContracts);
        }
        return;
      }
  
      // 5. Commercial: not supposed to reach this page — defend with empty
      setContracts([]);
    } catch (err) {
      console.error("[ComplianceReview] fetch error:", err);
      message.error("Impossible de charger les contrats en attente");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async () => {
    if (!approveModal?.contract) return;
    setSubmitting(true);
    try {
      const approvedByLabel = userRole === "admin" ? "Admin" : "Manager";
      // await axios.put(
      //   `/contrat/${approveModal.contract._id}/approve-compliance`,
      //   {
      //     approvedBy: approvedByLabel,
      //     approvedById: userId,
      //     notes: approveModal.notes || null,
      //   }
      // );
      await axios.put(
        `/contrat/${approveModal.contract._id}/approve-compliance`,
        {
          approvedBy: approvedByLabel,
          approvedById: userId,
          notes: approveModal.notes || null,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      message.success("Contrat approuvé");
      setApproveModal(null);
      fetchPending(); // refresh list
    } catch (err) {
      console.error("[ComplianceReview] approve error:", err);
      message.error(err?.response?.data?.message || "Erreur lors de l'approbation");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: "N° contrat",
      dataIndex: "contractNumber",
      key: "contractNumber",
      render: (v, row) => (
        <Space>
          <WarningOutlined style={{ color: "#faad14" }} />
          <b>{v || "—"}</b>
        </Space>
      ),
    },
    {
      title: "Client",
      key: "client",
      render: (_, row) => {
        const lead = row.lead || {};
        const name = lead.civilite === "societe"
          ? lead.denomination_commerciale
          : `${lead.prenom || ""} ${lead.nom || ""}`.trim();
        return (
          <div>
            <div>{name || "—"}</div>
            {lead._id && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {lead.categorie || ""} · {lead.agence || ""}
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: "Liste(s)",
      key: "lists",
      render: (_, row) => {
        const lists = row.screeningSnapshot?.lists || [];
        return (
          <Space size={4}>
            {lists.length === 0
              ? <Text type="secondary">—</Text>
              : lists.map((l) => <Tag key={l} color="red">{controlListLabel(l)}</Tag>)}
          </Space>
        );
      },
    },
    {
      title: "Précision",
      key: "accuracy",
      width: 110,
      render: (_, row) => {
        const acc = row.screeningSnapshot?.highestAccuracy;
        if (acc == null) return <Text type="secondary">—</Text>;
        return <Tag color={acc >= 99 ? "red" : "volcano"}>{acc}%</Tag>;
      },
    },
    {
      title: "Détecté le",
      key: "matchedAt",
      width: 180,
      render: (_, row) => fmtDate(row.screeningSnapshot?.matchedAt),
    },
    {
      title: "Actions",
      key: "actions",
      width: 260,
      render: (_, row) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => navigate(`/client/${row.lead?._id}`)}
          >
            Fiche client
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            size="small"
            onClick={() => setApproveModal({ contract: row, notes: "" })}
          >
            Approuver
          </Button>
        </Space>
      ),
    },
  ];

  // Expanded row shows the alerts from the lead's screening
  const expandedRowRender = (row) => {
    const alerts = row.lead?.efficialeScreening?.alerts || [];
    if (!alerts.length) {
      return <Text type="secondary">Aucun détail d'alerte disponible.</Text>;
    }
    return (
        <div style={{ padding: "12px 16px", backgroundColor: "#fafafa" }}>
          <Table
            size="small"
            pagination={false}
            showHeader={true}
            dataSource={alerts.map((a, i) => ({ ...a, key: a.id || i }))}
            columns={[
              {
                title: "Liste",
                dataIndex: "control_list",
                key: "control_list",
                width: 180,
                render: (v) => <Tag color="blue">{controlListLabel(v)}</Tag>,
              },
              {
                title: "Source",
                dataIndex: "source",
                key: "source",
              },
              {
                title: "Précision",
                dataIndex: "accuracy",
                key: "accuracy",
                width: 100,
                render: (v) => <Tag color={v >= 99 ? "red" : "volcano"}>{v}%</Tag>,
              },
              {
                title: "Nom détecté",
                dataIndex: "matched_name",
                key: "matched_name",
              },
              {
                title: "Date de naissance (détectée)",
                dataIndex: "birth_date",
                key: "birth_date",
                width: 180,
                render: (v) =>
                  v ? (
                    <Tag color="orange" style={{ fontWeight: 600 }}>
                      {v}
                    </Tag>
                  ) : (
                    <Text type="secondary">—</Text>
                  ),
              },
              {
                title: "Détecté le",
                dataIndex: "detected_at",
                key: "detected_at",
                width: 160,
              },
            ]}
          />
        </div>
      );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <Title level={3} className="mb-0 flex items-center gap-2">
          <SafetyOutlined />
          Contrats en attente de validation conformité
          {contracts.length > 0 && (
            <Badge count={contracts.length} style={{ backgroundColor: "#faad14" }} />
          )}
        </Title>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : contracts.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Aucun contrat en attente de validation conformité."
          />
        </Card>
      ) : (
        <Card bodyStyle={{ padding: 0 }}>
          <Table
            columns={columns}
            dataSource={contracts.map((c) => ({ ...c, key: c._id }))}
            expandedRowRender={expandedRowRender}
            pagination={false}
          />
        </Card>
      )}

      <Modal
        title="Approuver le contrat"
        open={!!approveModal}
        onCancel={() => !submitting && setApproveModal(null)}
        onOk={handleApprove}
        okText="Confirmer l'approbation"
        cancelText="Annuler"
        confirmLoading={submitting}
      >
        <div className="space-y-3">
          <Alert
            type="info"
            showIcon
            message={
              <span>
                Vous allez approuver le contrat{" "}
                <b>{approveModal?.contract?.contractNumber || "—"}</b>{" "}
                malgré les signalements détectés. Cette action sera enregistrée.
              </span>
            }
          />
          <div>
            <Text strong>Notes (optionnel)</Text>
            <TextArea
              rows={4}
              placeholder="Justification, contexte, vérifications complémentaires..."
              value={approveModal?.notes || ""}
              onChange={(e) => setApproveModal((m) => ({ ...m, notes: e.target.value }))}
              style={{ marginTop: 6 }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ComplianceReview;