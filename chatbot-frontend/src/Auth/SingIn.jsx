import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faEnvelope, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { UserContext } from "../UserContext";
// import logo from "../assets/images/chatbot-logo.png";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setToken } = useContext(UserContext);

  const handleUsernameChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const toggleShowPassword = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("/login", {
        email,
        password,
      });
      const token = response.data.token;
      setToken(token);
      const decodedToken = jwtDecode(token);
 
      if (decodedToken.role === "Commercial") {
        navigate("/list-leads");  // Redirect to /list-leads if user is commercial
      } else if (decodedToken.role === "Admin") {
        navigate("/");  // Redirect to home if user is admin
      } else if (decodedToken.role === "Manager") {
        navigate("/");  // Default fallback route
      } else {
        navigate("/"); 
      }
    } catch (e) {
      alert("Connexion échouée. Veuillez réessayer plus tard");
      console.error(e);
    }
  };

  return (
    <>
      <section className="relative w-full min-h-screen bg-[#1C1C1C]">
          <div className="flex justify-center  items-center px-6 py-16  h-full">
          <div className="bg-white rounded-lg h-full shadow-md p-6 space-y-4 md:space-y-6 sm:p-8 z-10 relative" style={{ maxWidth: "500px", width: "100%", heigth: "100%" }}>
         
          <h1 className="text-2xl font-bold text-black text-center">Connectez-vous à votre compte</h1>
          <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-semibold text-black">Votre email</label>
              <div className="flex items-center border border-gray-300 rounded-md focus-within:ring focus-within:ring-gray-500">
                <FontAwesomeIcon icon={faEnvelope} className="text-md mx-3 text-black" />
                <input
                  type="email"
                  name="email"
                  id="email"
                  onChange={handleUsernameChange}
                  className="bg-gray-200 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 block w-full p-2.5"
                  placeholder="nom@entreprise.com"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-semibold text-black">Mot de passe</label>
              <div className="flex items-center border border-gray-300 rounded-md focus-within:ring focus-within:ring-gray-500">
                <FontAwesomeIcon icon={faLock} className="text-md mx-3 text-black" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  onChange={handlePasswordChange}
                  className="bg-gray-200 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 block w-full p-2.5"
                  placeholder="••••••••"
                  required
                />
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-md mx-3 text-black cursor-pointer" onClick={toggleShowPassword} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              {/* <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input id="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-700 focus:ring-3" />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="remember" className="text-black">Se souvenir de moi</label>
                </div>
              </div> */}
              {/* <Link to="/ForgotPassword">
                <span className="text-sm font-medium text-purple-900 hover:underline">Mot de passe oublié?</span>
              </Link> */}
            </div>
            <button type="submit" className="w-full text-white bg-purple-900 hover:bg-purple-500 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
              Se connecter
            </button>
          </form>

          <p className="text-sm font-light text-gray-500 text-center">
            Vous n'avez pas de compte ?{" "}
            <Link to="/SignUp" className="font-medium text-purple-900 hover:underline">
              Inscrivez-vous
            </Link>
          </p> 
        </div>
      </div>
      </section>
    </>
  );
};

export default SignIn;