import Footer from "../../components/Footer/Footer";
import NavRoot from "../../components/NavRoot/NavRoot";
import AccountComponent from "../../components/accountComponents/accountComponent";

function Account() {
  return (
    <>
      <NavRoot namePage="Mon compte" />
      <AccountComponent />
      <Footer />
    </>
  );
}

export default Account;
