import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-red-600">403</h1>
      <p className="mt-2 text-gray-600">
        You don’t have permission to access this page
      </p>

      <button
        onClick={() => navigate(-1)}
        className="mt-6 px-6 py-2 bg-orange-600 text-white rounded-xl"
      >
        Go Back
      </button>
    </div>
  );
};

export default Unauthorized;
