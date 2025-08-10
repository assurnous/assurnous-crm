import React, { useState } from "react"; 
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faEnvelope, faUser, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";


const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const toggleShowPassword = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('/register', {
        name,
        email,
        password,
      });
      console.log("response", response);
      navigate("/SignIn");

    } catch (e) {
      alert('Registration failed. Please try again later');
      console.error(e);
    }
  };

  return (
    <section className="relative w-full min-h-screen bg-[#1C1C1C]">
      <div className="absolute inset-0 bg-black opacity-70"></div>
      <div className="flex justify-center items-center px-6 py-8 mx-auto h-full">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4 md:space-y-6 sm:p-8 z-10 relative" style={{ maxWidth: "500px", width: "100%" }}>
         
          <h1 className="text-xl font-bold leading-tight text-center tracking-tight text-black md:text-2xl">Créez votre compte</h1>
          <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-semibold text-black">Nom complet</label>
              <div className="flex items-center border-2 border-gray-500 rounded-md">
                <FontAwesomeIcon icon={faUser} className="text-md mx-3 text-black" />
                <input
                  type="text"
                  name="name"
                  id="name"
                  onChange={handleNameChange}
                  className="bg-gray-200 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 block w-full p-2.5"
                  placeholder="Votre nom"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-semibold text-black">Votre email</label>
              <div className="flex items-center border-2 border-gray-500 rounded-md">
                <FontAwesomeIcon icon={faEnvelope} className="text-md mx-3 text-black" />
                <input
                  type="email"
                  name="email"
                  id="email"
                  onChange={handleEmailChange}
                  className="bg-gray-200 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 block w-full p-2.5"
                  placeholder="nom@entreprise.com"
                  required
                />
              </div>
            </div>
            {/* <div>
              <label htmlFor="password" className="block mb-2 text-sm font-semibold text-black">Mot de passe</label>
              <div className="flex items-center border-2 border-gray-500 rounded-md">
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
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-md mx-3 text-white cursor-pointer" onClick={toggleShowPassword} />
              </div>
            </div> */}
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-semibold text-black">Mot de passe</label>
              <div className="flex items-center border-2 border-gray-500 rounded-md">
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
            <div>
              <label htmlFor="confirmPassword" className="block mb-2 text-sm font-semibold text-black">Confirmez le mot de passe</label>
              <div className="flex items-center border-2 border-gray-500 rounded-md">
                <FontAwesomeIcon icon={faLock} className="text-md mx-3 text-black" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  id="confirmPassword"
                  onChange={handleConfirmPasswordChange}
                  className="bg-gray-200 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 block w-full p-2.5"
                  placeholder="••••••••"
                  required
                />
                 <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-md mx-3 text-black cursor-pointer" onClick={toggleShowPassword} />
              </div>
            </div>
            
            <button type="submit" className="w-full text-white bg-purple-900 hover:bg-purple-500 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
              S'inscrire
            </button>
          </form>

          <p className="text-sm font-light text-gray-500 text-center">
            Vous avez déjà un compte ?{" "}
            <Link to="/SignIn" className="font-medium text-purple-900 hover:underline">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default SignUp;