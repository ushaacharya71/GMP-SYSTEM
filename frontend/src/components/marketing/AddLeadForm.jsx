import React, { useState } from "react";
import api from "../../api/axios";

const AddLeadForm = ({ refresh }) => {
  const [leads, setLeads] = useState("");
  const [forms, setForms] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await api.post("/leads/add", {
      leads: Number(leads),
      forms: Number(forms),
    });

    setLeads("");
    setForms("");
    refresh();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add Leads</h2>

      <form onSubmit={handleSubmit} className="flex gap-4 flex-wrap">
        <input
          type="number"
          placeholder="Leads"
          value={leads}
          onChange={(e) => setLeads(e.target.value)}
          className="border px-4 py-2 rounded-lg"
          required
        />

        <input
          type="number"
          placeholder="Forms"
          value={forms}
          onChange={(e) => setForms(e.target.value)}
          className="border px-4 py-2 rounded-lg"
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Add
        </button>
      </form>
    </div>
  );
};

export default AddLeadForm;