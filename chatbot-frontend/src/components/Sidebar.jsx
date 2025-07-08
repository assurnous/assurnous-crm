import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUserTie,
  faCaretLeft,
  faSignOutAlt,
  faFileContract,
  faChartBar,
  faFilePdf,
  faCalendarAlt,
  faCog,
  faStore,
  faBoxes,
  faFileInvoiceDollar,
  faExclamationCircle,
  faCalculator,
  faShieldAlt, 
  faClipboardCheck, 
  faBook, 
  faHandHoldingUsd,
  faUserMd,
  faBuilding,
  faUsers
} from "@fortawesome/free-solid-svg-icons";
import { UserOutlined } from "@ant-design/icons";
import { Layout, Menu, Divider, Avatar } from "antd";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { UserContext } from "../UserContext";
import { ToggleContext } from "./store/ToggleContext";
import logo from "../assets/logo.jpeg";

const { Sider } = Layout;
const { SubMenu } = Menu;

const SideBar = () => {
  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : "";
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken } = useContext(UserContext);
  const [profileVisible, setProfileVisible] = useState(false);
  const [profileImage, setProfileImage] = useState("");

  const { collapsed, onClickHandler } = useContext(ToggleContext);
  const [openKeys, setOpenKeys] = useState([]);


  const showProfile = () => setProfileVisible(true);

  useEffect(() => {
    const parentKey = items.find(item => 
      item.children?.some(child => location.pathname === child.key)
    )?.key;
    
    if (parentKey) {
      setOpenKeys([parentKey]);
    }
  }, [location.pathname]);

  // Handle submenu open/close
  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find(key => openKeys.indexOf(key) === -1);
    setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
  };

  const Logout = async () => {
    await axios.post("/logout");
    setToken(null);
    navigate("/SignIn");
  };
  const handleSettingsClick = () => {
    navigate("/Paramètres");
  };

  const getInitials = (name) => {
    const names = name?.split(" ");
    const initials = names?.map((n) => n[0]).join("");
    return initials?.toUpperCase();
  };

  const items = [
    {
      key: "/",
      icon: (
        <FontAwesomeIcon
          icon={faHome}
          style={{ fontSize: "18px", marginRight: "2px" }}
        />
      ),
      label: "Tableau de Bord",
      role: ["Admin", "Manager"],
    },
    {
      key: "portefeuille",
      icon: (
        <FontAwesomeIcon
          icon={faChartBar}
          style={{ fontSize: "18px", marginRight: "2px" }}
        />
      ),
      label: "Mon Portefeuille",
      
      children: [
        {
          key: "/clients",
      icon: (
        <FontAwesomeIcon
          icon={faUsers}
          style={{ fontSize: "18px", marginRight: "2px" }}
        />
      ),
      label: "Mes clients",
      role: ["Admin", "Manager"],
        },
        {
          key: "/clients-lists",
          icon: (
            <FontAwesomeIcon
              icon={faUsers}
              style={{ fontSize: "18px", marginRight: "2px" }}
            />
          ),
          label: "Mes clients",
          role: "Commercial",
        },
        {
          key: "/Contrats",
          icon: (
            <FontAwesomeIcon
              icon={faFileContract}
              style={{ fontSize: "18px", marginRight: "2px" }}
            />
          ),
          label: "Mes Contrats",
          role: ["Admin", "Commercial"],
        },
        {
          key: '/Sinistres',
          icon: (
            <FontAwesomeIcon
              icon={faFilePdf}
              style={{ fontSize: "18px", marginRight: "2px" }}
            />
          ),
          label: "Mes Sinistres",
          role: ["Admin", "Commercial"],
        }, 
        {
          key: '/reclamations',
          icon: (
            <FontAwesomeIcon
              icon={faExclamationCircle}
              style={{ fontSize: "18px", marginRight: "2px" }}
            />
          ),
          label: "Mes Réclamations",
          role: ["Admin", "Commercial"],
        }
      ],
    },
    {
      key: "marketplace",
      icon: (
        <FontAwesomeIcon
          icon={faStore} // you can change this icon to any other fitting one
          style={{ fontSize: "18px", marginRight: "2px" }}
        />
      ),
      label: "Ma Marketplace",
      children: [
        {
          key: "/catalogue",
          icon: (
            <FontAwesomeIcon
              icon={faBoxes} // Example icon for catalogue
              style={{ fontSize: "18px", marginRight: "2px" }}
            />
          ),
          label: "Mon catalogue",
          role: ["Admin", "Commercial"],
        },
        {
          key: "/devis",
          icon: (
            <FontAwesomeIcon
              icon={faFileInvoiceDollar} // Example icon for devis
              style={{ fontSize: "18px", marginRight: "2px" }}
            />
          ),
          label: "Mes devis",
          role: ["Admin", "Commercial"],
        },
        {
          key: "/tarification",
          icon: (
            <FontAwesomeIcon
              icon={faCalculator} // Example icon for tarification
              style={{ fontSize: "18px", marginRight: "2px" }}
            />
          ),
          label: "Ma tarification",
          role: ["Admin", "Commercial"],
        }
      ],
    },

    {
      key: "Coffre",
      icon: (
        <FontAwesomeIcon
          icon={faShieldAlt} // Represents security/protection (better for "coffre fort")
          style={{ fontSize: "18px", marginRight: "2px" }}
        />
      ),
      label: "Coffre fort conformité",
      children: [
        {
          key: "/Liste-de-conformité",
          icon: (
            <FontAwesomeIcon
              icon={faClipboardCheck} // Represents checklist/verification
              style={{ fontSize: "18px", marginRight: "2px" }}
            />
          ),
          label: "Liste de conformité",
          role: ["Admin", "Commercial"],
        },
        {
          key: "/Guide-de-conformité",
          icon: (
            <FontAwesomeIcon
              icon={faBook} // Represents a guide/reference book
              style={{ fontSize: "18px", marginRight: "2px" }}
            />
          ),
          label: "Guide de conformité",
          role: ["Admin", "Commercial"],
        },
      
      ],
    },
    {
      key: "/Mes-comissions",
      icon: (
        <FontAwesomeIcon
          icon={faHandHoldingUsd} // Represents money/commissions
          style={{ fontSize: "18px", marginRight: "2px" }}
        />
      ),
      label: "Mes commissions",
      role: ["Admin"],
    },
    {
      key: "/agenda",
      icon: (
        <FontAwesomeIcon
          icon={faCalendarAlt}
          style={{ fontSize: "18px", marginRight: "2px" }}
        />
      ),
      label: "Mon Agenda",
      role: ["Commercial", "Admin"],
    },

    {
      key: "moncabinet",
      icon: (
        <FontAwesomeIcon
          icon={faUserMd} // you can change this icon to any other fitting one
          style={{ fontSize: "18px", marginRight: "2px" }}
        />
      ),
      label: "Mon Cabinet",
      role: ["Admin"],
      children: [
        {
          key: "/Ma-structure",
          icon: (
            <FontAwesomeIcon
              icon={faBuilding} // Example icon for catalogue
              style={{ fontSize: "18px", marginRight: "2px" }}
            />
          ),
          label: "Ma structure",
          role: ["Admin"],
        },
        {
          key: "/Mes-interlocuteurs",
          icon: (
            <FontAwesomeIcon
              icon={faUsers} // Example icon for devis
              style={{ fontSize: "18px", marginRight: "2px" }}
            />
          ),
          label: "Mes interlocuteurs",
          role: ["Admin"],
        },
      ],
    },
   
  ];


  const hasAccess = (roleSetting, userRole) => {
    if (!roleSetting) return true;
    return Array.isArray(roleSetting)
      ? roleSetting.includes(userRole)
      : roleSetting === userRole;
  };
  const filteredItems = items
    .map((item) => {
      // Admin sees everything
      // if (decodedToken.role === "Admin") return item;
      if (item.children) {
        const filteredChildren = item.children.filter((child) =>
          hasAccess(child.role, decodedToken.role)
        );

        if (filteredChildren.length > 0) {
          return { ...item, children: filteredChildren };
        }

        return null; // No visible children, hide the item
      }

      return hasAccess(item.role, decodedToken.role) ? item : null;
    })
    .filter(Boolean);

  const toggleSidebar = () => {
    if (!decodedToken) {
      // Set sidebar to collapsed if token is missing (not logged in)
      onClickHandler(true);
    } else {
      // Set sidebar to expanded if token exists
      onClickHandler(false);
    }
  };

  useEffect(() => {
    toggleSidebar();
  }, []);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path);

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className="bg-white w-full flex flex-col"
      width={210}
    >
      <div
        className="absolute top-4 right-0 cursor-pointer text-purple-900 text-xl"
        onClick={onClickHandler}
      >
        <FontAwesomeIcon icon={faCaretLeft} />
      </div>

      {/* Profile Section - Always Visible Avatar */}
      <div
        className={`flex items-center space-x-2 px-6 py-4 ${
          collapsed ? "justify-start pl-1" : ""
        }`}
      >
        <Avatar
          src={profileImage}
          className="bg-purple-900 text-white text-lg rounded-md font-bold cursor-pointer hover:shadow-lg transition-all duration-300"
          size={30}
        >
          {!profileImage &&
            (decodedToken ? getInitials(decodedToken.name) : <UserOutlined />)}
        </Avatar>
        {!collapsed && (
          <div
            className="text-gray-800 text-sm font-medium cursor-pointer hover:text-blue-600"
            onClick={showProfile}
          >
            <div>{decodedToken?.name}</div>
            <div className="text-sm text-gray-500">{decodedToken?.role}</div>
          </div>
        )}
      </div>

      {/* Sidebar Menu - Main Items */}
      <Menu
        className="font-bold text-gray-600 mt-2 mr-12 w-full flex-grow"
        theme="white"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
      >
        {filteredItems.map((item) =>
          item.children ? (
            <SubMenu key={item.key} icon={item.icon} title={item.label}>
              {item.children.map((child) => (
                <Menu.Item
                  key={child.key}
                  icon={child.icon}
                  className={
                    isActive(child.key)
                      ? "bg-white text-gray-600"
                      : "hover:bg-purple-900 hover:text-white"
                  }
                >
                  {child.label}
                </Menu.Item>
              ))}
            </SubMenu>
          ) : (
            <Menu.Item
              key={item.key}
              icon={item.icon}
              className={
                isActive(item.key)
                  ? "bg-white text-gray-600"
                  : "hover:bg-purple-900 hover:text-white"
              }
            >
              {item.label}
            </Menu.Item>
          )
        )}
      </Menu>

      <Divider className="h-[2px]" style={{ backgroundColor: "#D1D5DB" }} />

      {/* Help, Settings, and Logout Section */}
      <div className="mr-12">
        <Menu
          className="font-bold bg-white text-gray-600"
          mode="inline"
          selectedKeys={[location.pathname]}
          theme="white"
        >
          <Menu.Item
            key="logout"
            icon={
              <FontAwesomeIcon
                icon={faSignOutAlt}
                style={{ fontSize: "20px", marginRight: "2px" }}
              />
            }
            onClick={Logout}
          >
            {"Se déconnecter"}
          </Menu.Item>
        </Menu>
       
      </div>
    </Sider>
  );
};

export default SideBar;
