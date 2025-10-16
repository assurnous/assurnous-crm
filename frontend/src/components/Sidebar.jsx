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
  faUsers,
  faBell
 
} from "@fortawesome/free-solid-svg-icons";
import { UserOutlined } from "@ant-design/icons";
import { Layout, Menu, Divider, Avatar, Badge } from "antd";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { UserContext } from "../UserContext";
import { ToggleContext } from "./store/ToggleContext";
import logo from "../assets/logo.jpeg";
import { useNotifications } from "../useNotifications";


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

  const { unreadCount, markAsRead, fetchUnreadCount  } = useNotifications();


  const showProfile = () => setProfileVisible(true);
  console.log('Sidebar - Unread count:', unreadCount);



  const handleNotificationClick = () => {
    console.log('🔔 Bell clicked, marking as read');
    markAsRead();
    fetchUnreadCount();
    navigate("/reclamations");
  };
 


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
      role: ["Admin"],
        },
        {
          key: "/clientdigital",
      icon: (
        <FontAwesomeIcon
          icon={faUsers}
          style={{ fontSize: "18px", marginRight: "2px" }}
        />
      ),
      label: "Client digital",
      role: ["Admin"],
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
          key: "/clients-list",
          icon: (
            <FontAwesomeIcon
              icon={faUsers}
              style={{ fontSize: "18px", marginRight: "2px" }}
            />
          ),
          label: "Mes clients",
          role: "Manager",
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
          role: ["Admin", "Commercial", "Manager"],
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
          role: ["Admin", "Commercial", "Manager"],
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
          role: ["Admin", "Commercial", "Manager"],
        },
        
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
      label: "Mes partenaires",
      children: [
        {
          key: "/catalogue",
          icon: (
            <FontAwesomeIcon
              icon={faBoxes} // Example icon for catalogue
              style={{ fontSize: "18px", marginRight: "2px" }}
            />
          ),
          label: "Compagnies",
          role: ["Admin", "Commercial", "Manager"],
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
          role: ["Admin", "Commercial", "Manager"],
        },
        // {
        //   key: "/tarification",
        //   icon: (
        //     <FontAwesomeIcon
        //       icon={faCalculator} // Example icon for tarification
        //       style={{ fontSize: "18px", marginRight: "2px" }}
        //     />
        //   ),
        //   label: "Ma tarification",
        //   role: ["Admin", "Commercial"],
        // }
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
      label: "Conformité",
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
          role: ["Admin", "Commercial", "Manager"],
        },
        // {
        //   key: "/Guide-de-conformité",
        //   icon: (
        //     <FontAwesomeIcon
        //       icon={faBook} // Represents a guide/reference book
        //       style={{ fontSize: "18px", marginRight: "2px" }}
        //     />
        //   ),
        //   label: "Guide de conformité",
        //   role: ["Admin", "Commercial"],
        // },
      
      ],
    },
    // {
    //   key: "/Mes-comissions",
    //   icon: (
    //     <FontAwesomeIcon
    //       icon={faHandHoldingUsd} // Represents money/commissions
    //       style={{ fontSize: "18px", marginRight: "2px" }}
    //     />
    //   ),
    //   label: "Mes commissions",
    //   role: ["Admin"],
    // },
    {
      key: "/agenda",
      icon: (
        <FontAwesomeIcon
          icon={faCalendarAlt}
          style={{ fontSize: "18px", marginRight: "2px" }}
        />
      ),
      label: "Mon Agenda",
      role: ["Commercial", "Admin", "Manager"],
    },

    {
      key: "structure",
      icon: (
        <FontAwesomeIcon
          icon={faShieldAlt} // you can change this icon to any other fitting one
          style={{ fontSize: "18px", marginRight: "2px" }}
        />
      ),
      label: "Gestion",
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
          label: "Affectation clients",
          role: ["Admin"],
          key: "/affect-leads",
          icon: (
            <FontAwesomeIcon
              icon={faUserTag}
              style={{ fontSize: "12px", marginRight: "2px" }}
            />
          ),
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
        className="absolute top-4 right-0 cursor-pointer text-blue-800 text-xl"
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
          className="bg-yellow-400 text-white text-lg rounded-md font-bold cursor-pointer hover:shadow-lg transition-all duration-300"
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
                      : "hover:bg-blue-800 hover:text-white"
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
                  : "hover:bg-blue-800 hover:text-white"
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
      <div 
          className={`flex items-center px-4 py-3 mr-6 cursor-pointer  rounded-md ${
            collapsed ? "justify-center" : "justify-between"
          }`}
          onClick={handleNotificationClick}
        >
          {/* {collapsed ? (
            <Badge 
              count={unreadCount}
              size="small" 
              offset={[-5, 5]} 
              style={{ backgroundColor: '#ff4d4f' }}
            >
              <FontAwesomeIcon
                icon={faBell}
                style={{ fontSize: "18px", color: "#6B7280" }}
              />
            </Badge>
          ) : (
            <>
              <div className="flex items-center ml-4">
                <FontAwesomeIcon
                  icon={faBell}
                  style={{ fontSize: "18px", marginRight: "12px", color: "#6B7280" }}
                />
                <span className="text-gray-600 text-sm">Demandes internes</span>
              </div>
             
                <Badge 
                  count={unreadCount}
                  size="small" 
                  style={{ 
                    backgroundColor: '#ff4d4f',
                    fontSize: '10px',
                    height: '16px',
                    minWidth: '16px',
                    lineHeight: '16px'
                  }} 
                />
           
            </>
          )} */}
           {collapsed ? (
        <Badge 
          count={unreadCount}
          size="small" 
          offset={[-5, 5]} 
          style={{ backgroundColor: '#ff4d4f' }}
        >
          <FontAwesomeIcon
            icon={faBell}
            style={{ fontSize: "18px", color: "#6B7280" }}
          />
        </Badge>
      ) : (
        <>
          <div className="flex items-center ml-4">
            <FontAwesomeIcon
              icon={faBell}
              style={{ fontSize: "18px", marginRight: "12px", color: "#6B7280" }}
            />
            <span className="text-gray-600 text-sm">Demandes internes</span>
          </div>
          <Badge 
            count={unreadCount}
            size="small" 
            style={{ 
              backgroundColor: '#ff4d4f',
              fontSize: '10px',
              height: '16px',
              minWidth: '16px',
              lineHeight: '16px'
            }} 
          />
        </>
      )}
        </div>

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