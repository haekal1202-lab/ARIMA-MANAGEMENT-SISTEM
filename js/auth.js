window.Auth = {

  STORAGE_KEY: "arima_session",

  current() {
    try {
      // Primary session key used by the current login flow.
      let raw = localStorage.getItem(this.STORAGE_KEY);

      // Backward compatibility with older builds.
      if (!raw) {
        raw = localStorage.getItem("ARIMA_USER");
      }

      if (!raw) {
        return null;
      }

      const user = JSON.parse(raw);

      if (!user || typeof user !== "object") {
        return null;
      }

      // Migrate old sessions automatically.
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        localStorage.setItem(
          this.STORAGE_KEY,
          JSON.stringify(user)
        );
      }

      return user;

    } catch (error) {
      console.error("Auth.current() error:", error);

      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem("ARIMA_USER");

      return null;
    }
  },

  setSession(user) {
    if (!user || typeof user !== "object") {
      return false;
    }

    try {
      const value = JSON.stringify(user);

      // Current key.
      localStorage.setItem(this.STORAGE_KEY, value);

      // Compatibility with older app builds.
      localStorage.setItem("ARIMA_USER", value);

      return true;

    } catch (error) {
      console.error("Auth.setSession() error:", error);
      return false;
    }
  },

  require() {
    const user = this.current();

    if (!user) {
      window.location.replace("login.html");
      return null;
    }

    return user;
  },

  isLoggedIn() {
    return !!this.current();
  },

  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem("ARIMA_USER");
    localStorage.removeItem("ARIMA_SESSION");
    localStorage.removeItem("ARIMA_TOKEN");

    sessionStorage.removeItem("ARIMA_TOKEN");

    window.location.replace("login.html");
  }

};
