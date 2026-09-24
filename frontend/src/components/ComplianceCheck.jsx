// // src/components/ComplianceCheck.jsx
// //
// // Efficiale compliance screening widget.
// // Renders on the lead detail page. Calls POST /lead/:id/screen
// // (which runs a fresh Efficiale search and persists the result back
// // onto the lead's `efficialeScreening` field).
// //
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   Card,
//   Button,
//   Tag,
//   Space,
//   Table,
//   Alert,
//   Tooltip,
//   Popconfirm,
//   Badge,
//   Skeleton,
//   Empty,
//   Typography,
//   message,
// } from "antd";
// import {
//   SafetyOutlined,
//   CheckCircleOutlined,
//   WarningOutlined,
//   CloseCircleOutlined,
//   ReloadOutlined,
//   SearchOutlined,
// } from "@ant-design/icons";

// const { Text } = Typography;

// // Threshold colors — kept here so they're easy to tune later.
// const STATUS_CONFIG = {
//   CLEAR: { color: "green",  icon: <CheckCircleOutlined />, label: "Aucun signalement" },
//   MATCH: { color: "red",    icon: <WarningOutlined />,     label: "Signalement(s) détecté(s)" },
//   ERROR: { color: "orange", icon: <CloseCircleOutlined />, label: "Erreur de vérification" },
// };

// function fmtDate(iso) {
//   if (!iso) return "-";
//   try {
//     const d = new Date(iso);
//     return d.toLocaleString("fr-FR", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   } catch {
//     return "-";
//   }
// }

// function accuracyColor(pct) {
//   if (pct >= 99) return "red";
//   if (pct >= 96) return "volcano";
//   return "orange";
// }

// function controlListLabel(code) {
//   switch (code) {
//     case "gel":       return "GEL (Sanctions)";
//     case "ppe_nat":   return "PPE Nationale";
//     case "ppe_inter": return "PPE Internationale";
//     default:          return code || "-";
//   }
// }

// const ComplianceCheck = ({ lead, onUpdate }) => {
//   const [loading, setLoading]   = useState(false);
//   const [errored, setErrored]   = useState(false);
//   const leadId                  = lead?._id;

//   // What state are we in?
//   const screening  = lead?.efficialeScreening || {};
//   const summary    = screening.summary || null;
//   const alerts     = Array.isArray(screening.alerts) ? screening.alerts : [];
//   const checkedAt  = screening.checkedAt || null;
//   const lastError  = screening.lastError || null;
  

//   // ── Manual check ────────────────────────────────────────────
//   const runCheck = async () => {
//     if (!leadId) return;
//     setLoading(true);
//     setErrored(false);
//     try {
//       const token = localStorage.getItem("token");
//       const { data } = await axios.post(
//         `/lead/${leadId}/screen`,
//         {},
//         { headers: token ? { Authorization: `Bearer ${token}` } : {} }
//       );

//       if (data?.lead && onUpdate) onUpdate(data.lead);

//       if (data?.data?.summary === "MATCH") {
//         message.warning(`${data.data.alerts?.length || 0} signalement(s) détecté(s)`);
//       } else {
//         message.success("Conformité vérifiée — aucun signalement");
//       }
//     } catch (err) {
//       console.error("[ComplianceCheck] error:", err);
//       setErrored(true);
//       const errMsg =
//         err?.response?.data?.message ||
//         err?.response?.data?.upstream?.error ||
//         err.message ||
//         "Erreur inconnue";
//       message.error(`Échec de la vérification : ${errMsg}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Table columns for MATCH results ─────────────────────────
//   const columns = [
//     {
//       title: "Liste",
//       dataIndex: "control_list",
//       key: "control_list",
//       width: 180,
//       render: (v) => <Tag color="blue">{controlListLabel(v)}</Tag>,
//     },
//     {
//       title: "Source",
//       dataIndex: "source",
//       key: "source",
//       render: (v) => v || "—",
//     },
//     {
//       title: "Précision",
//       dataIndex: "accuracy",
//       key: "accuracy",
//       width: 110,
//       render: (v) => <Tag color={accuracyColor(v)}>{v}%</Tag>,
//     },
//     {
//       title: "Nom détecté",
//       dataIndex: "matched_name",
//       key: "matched_name",
//       render: (v, row) => (
//         <div>
//           <div style={{ fontWeight: 500 }}>{v || "—"}</div>
//           {row.birth_date && (
//             <Text type="secondary" style={{ fontSize: 12 }}>
//               Né(e) le {row.birth_date}
//             </Text>
//           )}
//         </div>
//       ),
//     },
//   ];

//   // ── Render: three sections based on state ───────────────────

//   const headerBadge = () => {
//     if (loading) return <Badge status="processing" text="Vérification…" />;
//     if (summary === "MATCH") return <Badge status="error"   text="Signalement" />;
//     if (summary === "CLEAR") return <Badge status="success" text="Conforme" />;
//     if (summary === "ERROR") return <Badge status="warning" text="Erreur" />;
//     return <Badge status="default" text="Non vérifié" />;
//   };

//   return (
//     <Card
//       title={
//         <Space>
//           <SafetyOutlined />
//           <span>Conformité (Efficiale)</span>
//         </Space>
//       }
//       extra={headerBadge()}
//     >
//       {loading ? (
//         <Skeleton active paragraph={{ rows: 3 }} />
//       ) : !summary && !errored ? (
//         // ── Not yet checked ──────────────────────────────────────
//         <div className="text-center py-4">
//           <Empty
//             image={Empty.PRESENTED_IMAGE_SIMPLE}
//             description={
//               <span>Aucun contrôle de conformité effectué pour ce client.</span>
//             }
//           />
//           <Button
//             type="primary"
//             icon={<SearchOutlined />}
//             onClick={runCheck}
//             loading={loading}
//             style={{ marginTop: 12 }}
//           >
//             Vérifier la conformité
//           </Button>
//         </div>
//       ) : summary === "ERROR" || errored ? (
//         // ── Error state ──────────────────────────────────────────
//         <div>
//           <Alert
//             type="warning"
//             showIcon
//             message="Erreur lors de la vérification"
//             description={
//               <div>
//                 <div>{errored ? "La requête a échoué." : lastError || "Erreur inconnue"}</div>
//                 {checkedAt && (
//                   <Text type="secondary" style={{ fontSize: 12 }}>
//                     Dernière tentative : {fmtDate(checkedAt)}
//                   </Text>
//                 )}
//               </div>
//             }
//             style={{ marginBottom: 12 }}
//           />
//           <Popconfirm
//             title="Relancer la vérification ?"
//             description="Cela consommera un appel API Efficiale."
//             okText="Oui, relancer"
//             cancelText="Annuler"
//             onConfirm={runCheck}
//           >
//             <Button icon={<ReloadOutlined />} danger>
//               Réessayer
//             </Button>
//           </Popconfirm>
//         </div>
//       ) : summary === "MATCH" ? (
//         // ── MATCH state ──────────────────────────────────────────
//         <div>
//           <Alert
//             type="error"
//             showIcon
//             icon={<WarningOutlined />}
//             message={`${alerts.length} signalement(s) détecté(s)`}
//             description={
//               <Space direction="vertical" size={2}>
//                 <div>
//                   Liste(s) :{" "}
//                   {[...new Set(alerts.map((a) => a.control_list))]
//                     .map((l) => controlListLabel(l))
//                     .join(", ")}
//                 </div>
//                 <div>
//                   Précision maximale :{" "}
//                   <b>{Math.max(...alerts.map((a) => a.accuracy || 0))}%</b>
//                 </div>
//                 <Text type="secondary" style={{ fontSize: 12 }}>
//                   Vérifié le {fmtDate(checkedAt)}
//                 </Text>
//               </Space>
//             }
//             style={{ marginBottom: 12 }}
//           />

//           <Table
//             dataSource={alerts.map((a, i) => ({ ...a, key: a.id || i }))}
//             columns={columns}
//             size="small"
//             pagination={false}
//             expandable={{
//               expandedRowRender: (row) => (
//                 <div style={{ padding: "8px 4px" }}>
//                   <Text type="secondary" style={{ fontSize: 12 }}>
//                     Source brute : <b>{row.source || "—"}</b>
//                   </Text>
//                   {row.detected_at && (
//                     <div>
//                       <Text type="secondary" style={{ fontSize: 12 }}>
//                         Détecté le : {row.detected_at}
//                       </Text>
//                     </div>
//                   )}
//                   <div style={{ marginTop: 8 }}>
//                     <Text type="secondary" style={{ fontSize: 12 }}>
//                       Identifiant Efficiale : <code>{row.id}</code>
//                     </Text>
//                   </div>
//                 </div>
//               ),
//             }}
//             style={{ marginBottom: 12 }}
//           />

//           <Popconfirm
//             title="Relancer la vérification ?"
//             description="Cela consommera un appel API Efficiale."
//             okText="Oui, relancer"
//             cancelText="Annuler"
//             onConfirm={runCheck}
//           >
//             <Button icon={<ReloadOutlined />}>Re-vérifier</Button>
//           </Popconfirm>
//         </div>
//       ) : (
//         // ── CLEAR state ──────────────────────────────────────────
//         <div>
//           <Alert
//             type="success"
//             showIcon
//             icon={<CheckCircleOutlined />}
//             message="Aucun signalement"
//             description={
//               <div>
//                 <div>
//                   Ce client n'apparaît sur aucune des listes contrôlées
//                   {screening.lists?.length ? ` (${screening.lists.map(controlListLabel).join(", ")})` : ""}.
//                 </div>
//                 {screening.minAccuracy && (
//                   <Text type="secondary" style={{ fontSize: 12 }}>
//                     Seuil appliqué : {screening.minAccuracy}%
//                   </Text>
//                 )}
//                 <div>
//                   <Text type="secondary" style={{ fontSize: 12 }}>
//                     Vérifié le {fmtDate(checkedAt)}
//                   </Text>
//                 </div>
//               </div>
//             }
//             style={{ marginBottom: 12 }}
//           />
//           <Popconfirm
//             title="Relancer la vérification ?"
//             description="Cela consommera un appel API Efficiale."
//             okText="Oui, relancer"
//             cancelText="Annuler"
//             onConfirm={runCheck}
//           >
//             <Button icon={<ReloadOutlined />}>Re-vérifier</Button>
//           </Popconfirm>
//         </div>
//       )}
//     </Card>
//   );
// };

// export default ComplianceCheck;
// src/components/ComplianceCheck.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Card, Button, Tag, Space, Table, Alert, Popconfirm, Badge,
  Skeleton, Empty, Typography, message,
} from "antd";
import {
  SafetyOutlined, CheckCircleOutlined, WarningOutlined,
  CloseCircleOutlined, ReloadOutlined, SearchOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

function fmtDate(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return "-"; }
}

function accuracyColor(pct) {
  if (pct >= 99) return "red";
  if (pct >= 96) return "volcano";
  return "orange";
}

function controlListLabel(code) {
  switch (code) {
    case "gel":       return "GEL (Sanctions)";
    case "ppe_nat":   return "PPE Nationale";
    case "ppe_inter": return "PPE Internationale";
    default:          return code || "-";
  }
}

const ComplianceCheck = ({ lead, hasContract, onUpdate }) => {
  const [loading, setLoading]   = useState(false);
  const [errored, setErrored]   = useState(false);
  const autoRanRef              = useRef(false);
  const leadId                  = lead?._id;

  const screening  = lead?.efficialeScreening || {};
  const summary    = screening.summary || null;
  const alerts     = Array.isArray(screening.alerts) ? screening.alerts : [];
  const checkedAt  = screening.checkedAt || null;
  const lastError  = screening.lastError || null;

  // ── Manual check ────────────────────────────────────────────
  const runCheck = async ({ silent = false } = {}) => {
    if (!leadId) return;
    setLoading(true);
    setErrored(false);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `/lead/${leadId}/screen`,
        {},
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (data?.lead && onUpdate) onUpdate(data.lead);

      if (!silent) {
        if (data?.data?.summary === "MATCH") {
          message.warning(`${data.data.alerts?.length || 0} signalement(s) détecté(s)`);
        } else {
          message.success("Conformité vérifiée — aucun signalement");
        }
      }
    } catch (err) {
      console.error("[ComplianceCheck] error:", err);
      setErrored(true);
      if (!silent) {
        const errMsg =
          err?.response?.data?.message ||
          err?.response?.data?.upstream?.error ||
          err.message ||
          "Erreur inconnue";
        message.error(`Échec de la vérification : ${errMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Silent auto-run once on mount ────────────────────────────
  useEffect(() => {
    if (!leadId) return;
    if (autoRanRef.current) return;
    const alreadyChecked = !!lead?.efficialeScreening?.checkedAt;
    if (hasContract && !alreadyChecked) {
      autoRanRef.current = true;
      runCheck({ silent: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId, hasContract]);

  // ── Visibility rule ──────────────────────────────────────────
  // Prospects without a contract AND without a prior screening: hide.
  if (!hasContract && !checkedAt) return null;

  const columns = [
    {
      title: "Liste",
      dataIndex: "control_list",
      key: "control_list",
      width: 180,
      render: (v) => <Tag color="blue">{controlListLabel(v)}</Tag>,
    },
    { title: "Source", dataIndex: "source", key: "source", render: (v) => v || "—" },
    {
      title: "Précision",
      dataIndex: "accuracy",
      key: "accuracy",
      width: 110,
      render: (v) => <Tag color={accuracyColor(v)}>{v}%</Tag>,
    },
    // {
    //   title: "Nom détecté",
    //   dataIndex: "matched_name",
    //   key: "matched_name",
    //   render: (v, row) => (
    //     <div>
    //       <div style={{ fontWeight: 500 }}>{v || "—"}</div>
    //       {row.birth_date && (
    //         <Text type="secondary" style={{ fontSize: 12 }}>
    //           Né(e) le {row.birth_date}
    //         </Text>
    //       )}
    //     </div>
    //   ),
    // },
    {
      title: "Nom détecté",
      dataIndex: "matched_name",
      key: "matched_name",
    },
    {
      title: "Date de naissance",
      dataIndex: "birth_date",
      key: "birth_date",
      width: 150,
      render: (v) =>
        v ? (
          <Tag color="orange" style={{ fontWeight: 600 }}>
            {v}
          </Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
  ];

  const headerBadge = () => {
    if (loading) return <Badge status="processing" text="Vérification…" />;
    if (summary === "MATCH") return <Badge status="error"   text="Signalement" />;
    if (summary === "CLEAR") return <Badge status="success" text="Conforme" />;
    if (summary === "ERROR") return <Badge status="warning" text="Erreur" />;
    return <Badge status="default" text="Non vérifié" />;
  };

  return (
    <Card
      title={<Space><SafetyOutlined /><span>Conformité (Efficiale)</span></Space>}
      extra={headerBadge()}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : !summary && !errored ? (
        <div className="text-center py-4">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span>Aucun contrôle de conformité effectué pour ce client.</span>}
          />
          <Button
            type="primary" icon={<SearchOutlined />}
            onClick={() => runCheck()} loading={loading} style={{ marginTop: 12 }}
          >
            Vérifier la conformité
          </Button>
        </div>
      ) : summary === "ERROR" || errored ? (
        <div>
          <Alert
            type="warning" showIcon message="Erreur lors de la vérification"
            description={
              <div>
                <div>{errored ? "La requête a échoué." : lastError || "Erreur inconnue"}</div>
                {checkedAt && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Dernière tentative : {fmtDate(checkedAt)}
                  </Text>
                )}
              </div>
            }
            style={{ marginBottom: 12 }}
          />
          <Popconfirm
            title="Relancer la vérification ?"
            description="Cela consommera un appel API Efficiale."
            okText="Oui, relancer" cancelText="Annuler"
            onConfirm={() => runCheck()}
          >
            <Button icon={<ReloadOutlined />} danger>Réessayer</Button>
          </Popconfirm>
        </div>
      ) : summary === "MATCH" ? (
        <div>
          <Alert
            type="error" showIcon icon={<WarningOutlined />}
            message={`${alerts.length} signalement(s) détecté(s)`}
            description={
              <Space direction="vertical" size={2}>
                <div>
                  Liste(s) :{" "}
                  {[...new Set(alerts.map((a) => a.control_list))]
                    .map((l) => controlListLabel(l)).join(", ")}
                </div>
                <div>
                  Précision maximale :{" "}
                  <b>{Math.max(...alerts.map((a) => a.accuracy || 0))}%</b>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Vérifié le {fmtDate(checkedAt)}
                </Text>
              </Space>
            }
            style={{ marginBottom: 12 }}
          />
          <Table
            dataSource={alerts.map((a, i) => ({ ...a, key: a.id || i }))}
            columns={columns} size="small" pagination={false}
            expandable={{
              expandedRowRender: (row) => (
                <div style={{ padding: "8px 4px" }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Source brute : <b>{row.source || "—"}</b>
                  </Text>
                  {row.detected_at && (
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Détecté le : {row.detected_at}
                      </Text>
                    </div>
                  )}
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Identifiant Efficiale : <code>{row.id}</code>
                    </Text>
                  </div>
                </div>
              ),
            }}
            style={{ marginBottom: 12 }}
          />
          <Popconfirm
            title="Relancer la vérification ?"
            description="Cela consommera un appel API Efficiale."
            okText="Oui, relancer" cancelText="Annuler"
            onConfirm={() => runCheck()}
          >
            <Button icon={<ReloadOutlined />}>Re-vérifier</Button>
          </Popconfirm>
        </div>
      ) : (
        <div>
          <Alert
            type="success" showIcon icon={<CheckCircleOutlined />}
            message="Aucun signalement"
            description={
              <div>
                <div>
                  Ce client n'apparaît sur aucune des listes contrôlées
                  {screening.lists?.length
                    ? ` (${screening.lists.map(controlListLabel).join(", ")})`
                    : ""}.
                </div>
                {screening.minAccuracy && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Seuil appliqué : {screening.minAccuracy}%
                  </Text>
                )}
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Vérifié le {fmtDate(checkedAt)}
                  </Text>
                </div>
              </div>
            }
            style={{ marginBottom: 12 }}
          />
          <Popconfirm
            title="Relancer la vérification ?"
            description="Cela consommera un appel API Efficiale."
            okText="Oui, relancer" cancelText="Annuler"
            onConfirm={() => runCheck()}
          >
            <Button icon={<ReloadOutlined />}>Re-vérifier</Button>
          </Popconfirm>
        </div>
      )}
    </Card>
  );
};

export default ComplianceCheck;