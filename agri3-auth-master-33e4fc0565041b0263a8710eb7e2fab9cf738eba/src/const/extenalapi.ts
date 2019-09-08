
const DEMO_AUTH_HOST = process.env["DEMO_AUTH_HOST"];

const DEMO_SERVER = {
  API_CHECK_GAGO_USERS: DEMO_AUTH_HOST + "/api/v1/demo/validate"
};

export { DEMO_AUTH_HOST, DEMO_SERVER };
