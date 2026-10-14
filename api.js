window.API = (() => {
  "use strict";

  const saveActions = {
    students: "studentSave",
    sensei: "senseiSave",
    attendance: "attendanceSave",
    billing: "billingSave",
    finance: "financeSave",
    payments: "paymentSave",
    salary: "salarySave"
  };

  const deleteActions = {
    students: "studentDelete",
    sensei: "senseiDelete"
  };

  function tokenStorageKey() {
    return String(window.ARIMA_TOKEN_KEY || "ARIMA_TOKEN");
  }

  function getToken() {
    return (
      localStorage.getItem(tokenStorageKey()) ||
      sessionStorage.getItem(tokenStorageKey()) ||
      ""
    );
  }

  function saveToken(token) {
    if (token) {
      localStorage.setItem(tokenStorageKey(), token);
    }
  }

  function clearToken() {
    localStorage.removeItem(tokenStorageKey());
    sessionStorage.removeItem(tokenStorageKey());
  }

  async function call(action, payload = {}) {

    const config = window.ARIMA_CONFIG;

    if (!config || !config.API_URL) {
      throw new Error(
        "API_URL ARIMA Apps belum dikonfigurasi."
      );
    }

    const response = await fetch(
      config.API_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },

        body: JSON.stringify({
          action: action,
          payload: payload,
          token: getToken()
        })
      }
    );

    const text = await response.text();

    let result;

    try {
      result = JSON.parse(text);
    } catch (error) {

      console.error(
        "Response ARIMA Apps:",
        text
      );

      throw new Error(
        "ARIMA Apps mengembalikan response yang bukan JSON."
      );
    }

    if (
      result &&
      result.code === "AUTH_REQUIRED"
    ) {
      clearToken();

      throw new Error(
        result.message ||
        "Session tidak valid. Silakan login kembali."
      );
    }

    return result;
  }

  async function login(userId, password) {

    const result = await call(
      "login",
      {
        userId: String(userId || "").trim(),
        password: String(password || "")
      }
    );

    if (
      result &&
      result.success === true &&
      result.token
    ) {
      saveToken(result.token);
    }

    return result;
  }

  async function logout() {

    try {
      await call("logout", {});
    } catch (error) {
      console.warn(
        "Logout API:",
        error
      );
    }

    clearToken();
    localStorage.removeItem(
      "arima_session"
    );
  }

  async function health() {
    return call("health", {});
  }

  async function dashboard() {
    return call("dashboard", {});
  }

  async function students(payload = {}) {
    return call("students", payload);
  }

  async function assignStudentIds() {
    return call("assignStudentIds", {});
  }

  async function assignSenseiIds() {
    return call("assignSenseiIds", {});
  }

  async function sensei(payload = {}) {
    return call("sensei", payload);
  }

  async function attendance(payload = {}) {
    return call("attendance", payload);
  }

  async function attendanceProfile() {
    return call("attendanceProfile", {});
  }

  async function selfAttendance(payload) {
    return call("selfAttendance", payload);
  }

  async function billing(payload = {}) {
    return call("billing", payload);
  }

  async function payments(payload = {}) {
    return call("payments", payload);
  }

  async function finance(payload = {}) {
    return call("finance", payload);
  }

  async function salary(payload = {}) {
    return call("salary", payload);
  }

  async function salaryPreview(payload = {}) {
    return call("salaryPreview", payload);
  }

  async function users() {
    return call("users", {});
  }

  async function generateUserIds() {
    return call("generateUserIds", {});
  }

  async function userCreate(payload) {
    return call("userCreate", payload);
  }

  async function userReset(payload) {
    return call("userReset", payload);
  }

  async function userDelete(payload) {
    return call("userDelete", payload);
  }

  async function reports(payload = {}) {
    return call("reports", payload);
  }

  async function studentSave(payload) {
    return call("studentSave", payload);
  }

  async function studentDelete(payload) {
    return call("studentDelete", payload);
  }

  async function senseiSave(payload) {
    return call("senseiSave", payload);
  }

  async function senseiDelete(payload) {
    return call("senseiDelete", payload);
  }

  async function attendanceSave(payload) {
    return call("attendanceSave", payload);
  }

  async function billingSave(payload) {
    return call("billingSave", payload);
  }

  async function paymentSave(payload) {
    return call("paymentSave", payload);
  }

  async function financeSave(payload) {
    return call("financeSave", payload);
  }

  async function salarySave(payload) {
    return call("salarySave", payload);
  }

  async function create(type, payload = {}) {
    const action = saveActions[String(type || "").toLowerCase()];
    if (!action) throw new Error("Aksi tambah tidak tersedia untuk " + type + ".");
    return call(action, { ...payload, __MODE: "create" });
  }

  async function update(type, payload = {}) {
    const action = saveActions[String(type || "").toLowerCase()];
    if (!action) throw new Error("Aksi edit tidak tersedia untuk " + type + ".");
    return call(action, { ...payload, __MODE: "update" });
  }

  async function deleteRecord(type, payload = {}) {
    const action = deleteActions[String(type || "").toLowerCase()];
    if (!action) throw new Error("Aksi hapus tidak tersedia untuk " + type + ".");
    return call(action, payload);
  }

  return {

    call,

    login,

    logout,

    health,

    dashboard,

    students,

    assignStudentIds,

    assignSenseiIds,

    sensei,

    attendance,

    attendanceProfile,

    selfAttendance,

    billing,

    payments,

    finance,

    salary,

    salaryPreview,

    users,

    generateUserIds,

    userCreate,

    userReset,

    userDelete,

    reports,

    studentSave,

    studentDelete,

    senseiSave,

    senseiDelete,

    attendanceSave,

    billingSave,

    paymentSave,

    financeSave,

    salarySave,

    create,

    update,

    delete: deleteRecord,

    getToken,

    saveToken,

    clearToken

  };

})();
