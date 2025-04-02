import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ContactProvider } from "./context/ContactContext";
import Contact from "./views/Contact";
import AddContact from "./views/AddContact";
import "./index.css";

function App() {
  return (
    <Router>
      <ContactProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Contact />} />
            <Route path="/add" element={<AddContact />} />
            <Route path="/edit/:id" element={<AddContact />} />
          </Routes>
        </div>
      </ContactProvider>
    </Router>
  );
}

export default App;
