// import React, { useContext, useState } from "react";
// import {
//   Layout,
//   Button,
//   Modal,
//   Form,
//   Avatar,
//   Input as AntdInput,
// } from "antd";
// import {
//   UserOutlined,
//   LogoutOutlined,
//   SettingOutlined,
//   SearchOutlined,
// } from "@ant-design/icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEdit, faClose, faHome } from "@fortawesome/free-solid-svg-icons";
// import { Link, useNavigate } from "react-router-dom";
// import { Menu, Dropdown } from "antd";
// import {jwtDecode} from "jwt-decode";
// import axios from "axios";
// import { UserContext } from "../UserContext";

// const Navbar = () => {
//   const token = localStorage.getItem("token");
//   const decodedToken = token ? jwtDecode(token) : null;
//   const navigate = useNavigate();
//   const { setToken } = useContext(UserContext);

//   const Logout = async () => {
//     await axios.post("/logout");
//     setToken(null);
//     navigate("/SignIn");
//   };

//   const menu = (
//     <Menu>
//       <Menu.Item key="settings" icon={<SettingOutlined />}>
//         Settings
//       </Menu.Item>
//       <Menu.Item onClick={Logout} key="logout" icon={<LogoutOutlined />}>
//         Logout
//       </Menu.Item>
//     </Menu>
//   );

//   const role = decodedToken?.role;
//   const { Header } = Layout;
//   const [profileVisible, setProfileVisible] = useState(false);
//   const [profileImage, setProfileImage] = useState("");

//   const showProfile = () => {
//     setProfileVisible(true);
//   };

//   const hideProfile = () => {
//     setProfileVisible(false);
//   };

//   const getInitials = (name) => {
//     const names = name?.split(" ");
//     const initials = names?.map((n) => n[0]).join("");
//     return initials?.toUpperCase();
//   };

//   return (
//     <Header
//       className="flex items-center justify-between bg-white rounded-md shadow-md"
//       style={{ maxHeight: "100%", padding: "0 25px" }}
//     >
//         <div className="flex items-center">
//          {/* Added FontAwesome home icon next to Dashboard text */}
//          <FontAwesomeIcon icon={faHome} className="text-black text-2xl mr-2" />
//          <h1 className="font-bold text-black">Dashboard</h1>
//        </div>
//       <div className="flex items-center space-x-6">
//          <div className="flex items-center">
//            <AntdInput
//              placeholder="Search..."
//              prefix={<SearchOutlined />}
//              style={{
//                borderRadius: "999px",
//                padding: "0.5rem 1rem",
//                maxWidth: "300px",
//                background: "#fff",
//              }}
//            />
//          </div>

//       {/* Right Section */}
//       <div className="flex items-center">
//         <Avatar
//           src={profileImage}
//           className="bg-black mr-4 cursor-pointer hover:shadow-lg transition-shadow"
//           size={40}
//         >
//           {!profileImage &&
//             (decodedToken ? getInitials(decodedToken.name) : <UserOutlined />)}
//         </Avatar>
//         <div
//           className="text-gray-800 text-lg font-medium cursor-pointer mr-4 hover:text-blue-600"
//           onClick={showProfile}
//         >
//           <div>{decodedToken?.name}</div>
//           <div className="text-sm text-gray-500">{role}</div>
//         </div>
//         <Dropdown overlay={menu}>
//           <SettingOutlined className="text-gray-800 text-2xl cursor-pointer hover:text-blue-600 transition-all duration-200" />
//         </Dropdown>
//       </div>
//     </div>
//       {/* Profile Modal */}
//       <Modal
//         title="Profile"
//         visible={profileVisible}
//         onCancel={hideProfile}
//         footer={null}
//       >
//         <Form layout="vertical">
//           <Form.Item label="Name">
//             <AntdInput defaultValue={decodedToken?.name} />
//           </Form.Item>
//           <Form.Item label="Role">
//             <AntdInput defaultValue={role} />
//           </Form.Item>
//           <Link to="/profile">
//             <Button
//               onClick={hideProfile}
//               type="primary"
//               icon={<FontAwesomeIcon icon={faEdit} />}
//               className="mr-2"
//             >
//               Edit
//             </Button>
//           </Link>
//           <Button
//             onClick={hideProfile}
//             icon={<FontAwesomeIcon icon={faClose} />}
//           >
//             Close
//           </Button>
//         </Form>
//       </Modal>
//     </Header>
//   );
// };

// export default Navbar;
import React, { useContext, useState } from "react";
import {
  Layout,
  Button,
  Modal,
  Form,
  Avatar,
  Input as AntdInput,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faClose, faHome } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Dropdown } from "antd";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { UserContext } from "../UserContext";

const Navbar = () => {
  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null;
  const navigate = useNavigate();
  const { setToken } = useContext(UserContext);

  const Logout = async () => {
    await axios.post("/logout");
    setToken(null);
    navigate("/SignIn");
  };

  const menu = (
    <Menu>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Settings
      </Menu.Item>
      <Menu.Item onClick={Logout} key="logout" icon={<LogoutOutlined />}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const role = decodedToken?.role;
  const { Header } = Layout;
  const [profileVisible, setProfileVisible] = useState(false);
  const [profileImage, setProfileImage] = useState("");

  const showProfile = () => {
    setProfileVisible(true);
  };

  const hideProfile = () => {
    setProfileVisible(false);
  };

  const getInitials = (name) => {
    const names = name?.split(" ");
    const initials = names?.map((n) => n[0]).join("");
    return initials?.toUpperCase();
  };

  return (
    <Header
      className="flex items-center justify-between bg-white rounded-md shadow-xl px-6 py-4"
      style={{ maxHeight: "100%" }}
    >
    <div>

        {/* Right Section */}
        <div className="flex items-center space-x-6">
          <Avatar
            src={profileImage}
            className="bg-gray-800 text-white cursor-pointer hover:shadow-lg transition-all duration-300"
            size={40}
          >
            {!profileImage && (decodedToken ? getInitials(decodedToken.name) : <UserOutlined />)}
          </Avatar>

          <div
            className="text-gray-800 text-lg font-medium cursor-pointer hover:text-blue-600"
            onClick={showProfile}
          >
            <div>{decodedToken?.name}</div>
            <div className="text-sm text-gray-500">{role}</div>
          </div>

          <Dropdown overlay={menu}>
            <SettingOutlined className="text-gray-800 text-2xl cursor-pointer hover:text-blue-600 transition-all duration-200" />
          </Dropdown>
        </div>
      </div>

      {/* Profile Modal */}
      <Modal
        title="Profile"
        visible={profileVisible}
        onCancel={hideProfile}
        footer={null}
        className="rounded-md"
      >
        <Form layout="vertical">
          <Form.Item label="Name">
            <AntdInput defaultValue={decodedToken?.name} />
          </Form.Item>
          <Form.Item label="Role">
            <AntdInput defaultValue={role} />
          </Form.Item>
          <Link to="/profile">
            <Button
              onClick={hideProfile}
              type="primary"
              icon={<FontAwesomeIcon icon={faEdit} />}
              className="mr-2"
            >
              Edit
            </Button>
          </Link>
          <Button
            onClick={hideProfile}
            icon={<FontAwesomeIcon icon={faClose} />}
          >
            Close
          </Button>
        </Form>
      </Modal>
    </Header>
  );
};

export default Navbar;
