import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./Auth/SingIn";
import SignUp from "./Auth/SignUp";
import axios from "axios";
import { UserContextProvider } from "./UserContext";
import { ToggleProvider } from "./components/store/ToggleContext";
import Leads from "./pages/Leads";
import Layout from "./Layout";
import Programmes from "./pages/Programmes";
import Entreprise from "./pages/Entreprise";
import CreateBannières from "./pages/CreateBannières";
import LeadDetailsPage from "./pages/LeadDetailsPage";
import Banner from "./pages/Banner";
import MagicSms from "./pages/MagicSms";
import Setting from "./pages/Setting";
import CommentairePage from "./pages/CommentairePage";
import AffectuerLead from "./pages/AffectuerLead";
import CommerciauxPage from "./pages/CommerciauxPage";
import ListLeads from "./pages/Commercial/ListLeads";
// import Commands from "./pages/Commercial/Commands";
import CreatePrograms from "./pages/CreatePrograms";
import Publicités from "./pages/Publicités";
import CreatePub from "./pages/CreatePub";
import CreateCommand from "./pages/CreateCommand";
import AjouterProduit from "./pages/AjouterProduit";

import MyCalendar from "./pages/Calendar";
import TéléchargerDevis from "./pages/TéléchargerDevis";
import AllCommands from "./pages/TéléchargerContract";
import Facture from "./components/Reclamations";
import ImportLeads from "./pages/ImportLeads";
import TicketDetail from "./pages/Admin/TicketDetail";
import Sinistres from "./pages/Sinistres";
import Catalogue from "./pages/Catalogue";
import Tarification from "./pages/Tarification";
import ListeDeConformité from "./pages/ListeDeConformité";
import GuideDeConformité from "./pages/GuideDeConformité";
import Commissions from "./pages/Commissions";
import Mastructure from "./pages/Mastructure";
import Interlouteurs from "./pages/Interlouteurs";


axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.withCredentials = true;
export const callApiClient = axios.create({
  baseURL: import.meta.env.VITE_CALL_API_BASE_URL,
  withCredentials: true,
});
console.log("VITE_CALL_API_BASE_URL:", import.meta.env.VITE_CALL_API_BASE_URL);

function App() {
  
  return (
    <ToggleProvider>
      <ToggleProvider></ToggleProvider>
      <UserContextProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* `index` for Home to display only at `/` */}
            <Route index element={<Home />} />
            {/* Route for Leads at `/leads` */}
            <Route path="clients" element={<Leads />} />
            <Route path="leads/:id/ajouter-produit" element={<AjouterProduit />} />
            <Route path="leads/:id/ajouter-produit/:produitId" element={<AjouterProduit />} />
            <Route path="/produits" element={<Programmes />} />
            <Route path="/entreprise" element={<Entreprise />} />
            <Route path="/bannières" element={<Banner />} />
            <Route path="/create-bannières" element={<CreateBannières />} />
            <Route path="/create-bannières/:id" element={<CreateBannières />} />
            <Route path="/create-produit" element={<CreatePrograms />} />
            <Route path="/create-produit/:id" element={<CreatePrograms />} />

            <Route path="/agenda" element={<MyCalendar />} />
            <Route path="/Devis" element={<TéléchargerDevis />} />
            <Route path='/reclamations' element={<Facture/>} />
            <Route path="/reclamations/:id" element={<TicketDetail />} />
            <Route path="/Contrats" element={<AllCommands />} />
            <Route path="/Sinistres" element={<Sinistres />} />
            <Route path="/Liste-de-conformité" element={<ListeDeConformité />} />
            <Route path="/Guide-de-conformité" element={<GuideDeConformité />} />
            <Route path="/Mes-comissions" element={<Commissions />} />
            <Route path="/Ma-structure" element={<Mastructure />} />
            <Route path="/Mes-interlocuteurs" element={<Interlouteurs />} />






            <Route path="/import-leads" element={<ImportLeads />} />
            {/* <Route path="/lead/:id" element={<LeadDetailsPage />}/> */}
            <Route path="/affect-leads" element={<AffectuerLead />} />
            <Route path="/Paramètres" element={<CommerciauxPage />} />
            <Route path="/clients-lists" element={<ListLeads />} />
            <Route path="/magic-sms" element={<MagicSms />} />
            <Route path="/publicités" element={<Publicités />} />
            <Route path="/create-publicité" element={<CreatePub />} />
            <Route path="/create-publicité/:id" element={<CreatePub />} />
            <Route path="/settings" element={<Setting />} />
            {/* <Route path="/command/:leadId" element={<Commands />} /> */}

            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/tarification" element={<Tarification />} />
            
            

            <Route path="/leads/:id/create-command" element={<CreateCommand />} />
            <Route path="/leads/:id/create-command/:commandId" element={<CreateCommand />} />

            <Route path="/client/:id" element={<LeadDetailsPage />}>
              <Route path="" element={<LeadDetailsPage />} />{" "}
              {/* Default Tab */}
              <Route path="commentaires" element={<CommentairePage />} />
            </Route>
          </Route>
         
          {/* Separate routes for authentication */}
          <Route path="/SignIn" element={<SignIn />} />
          <Route path="/SignUp" element={<SignUp />} />
        </Routes>
      </UserContextProvider>
    </ToggleProvider>
  );
}

export default App;
