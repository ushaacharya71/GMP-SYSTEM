// // import React from "react";
// // import { Navigate } from "react-router-dom";

// // const ProtectedRoute = ({ children, allowedRoles }) => {
// //   const token = localStorage.getItem("token");
// //   const user = JSON.parse(localStorage.getItem("user"));

// //   const isAuthenticated =
// //     token && token !== "undefined" && token !== "null" && user;

// //   if (!isAuthenticated) {
// //     return <Navigate to="/" replace />;
// //   }

// //   if (allowedRoles && !allowedRoles.includes(user.role)) {
// //     return <Navigate to="/unauthorized" replace />;
// //   }

// //   return children;
// // };

// // export default ProtectedRoute;

// import React from "react";
// import { Navigate } from "react-router-dom";

// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const token = localStorage.getItem("token");
//   const user = JSON.parse(localStorage.getItem("user"));

//   if (!token || !user) {
//     return <Navigate to="/" replace />;
//   }

//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;

// import { Navigate, useLocation } from "react-router-dom";

// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const location = useLocation();
//   const token = localStorage.getItem("token");
//   const user = JSON.parse(localStorage.getItem("user"));

//   if (!token || !user) {
//     return <Navigate to="/" replace />;
//   }

//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     return (
//       <Navigate
//         to="/unauthorized"
//         replace
//         state={{ from: location.pathname }}
//       />
//     );
//   }

//   return children;
// };

// export default ProtectedRoute;


// import { Navigate } from "react-router-dom";

// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const token = localStorage.getItem("token");
//   const userRaw = localStorage.getItem("user");

//   if (!token || !userRaw) {
//     return <Navigate to="/" replace />;
//   }

//   let user;
//   try {
//     user = JSON.parse(userRaw);
//   } catch {
//     return <Navigate to="/" replace />;
//   }

//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;

import { Navigate, useLocation } from "react-router-dom";

const PUBLIC_PATHS = [
  "/",
  "/forgot-password",
];

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();

  // ✅ Allow public auth routes always
  if (
    PUBLIC_PATHS.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password")
  ) {
    return children;
  }

  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");

  // 🔒 Not authenticated
  if (!token || !userRaw) {
    return <Navigate to="/" replace />;
  }

  let user;
  try {
    user = JSON.parse(userRaw);
  } catch {
    return <Navigate to="/" replace />;
  }

  // 🚫 Role not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
