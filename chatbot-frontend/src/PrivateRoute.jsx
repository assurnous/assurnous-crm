import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext";

export default function PrivateRoute({ children }) {
  const { user } = useContext(UserContext);

  return user ? children : <Navigate to="/" />;
}
