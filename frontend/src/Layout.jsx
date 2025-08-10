// import { useContext } from "react";
// import { Outlet, Navigate } from "react-router-dom";
// import { UserContext } from "./UserContext";
// import SideBar from "./components/Sidebar";

// export default function Layout() {
//   const { isLoggedIn } = useContext(UserContext);

//   if (!isLoggedIn()) {
//     return <Navigate to="/SignIn" replace />;
//   }

//   return (
//     <div className="flex h-screen bg-gray-200">
//       <SideBar />
//       <main className="flex-1 p-4 h-full bg-gray-200">
//         <Outlet />
//       </main>
//     </div>
//   );
// }
import { useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import SideBar from "./components/Sidebar";

export default function Layout() {
  const { isLoggedIn } = useContext(UserContext);

  if (!isLoggedIn()) {
    return <Navigate to="/SignIn" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-200 overflow-hidden">
      <SideBar />
      <main className="flex-1 flex flex-col overflow-auto bg-gray-200 p-4">
        <div className="flex-grow h-full ">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
