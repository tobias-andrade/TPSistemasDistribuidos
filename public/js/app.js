let auth0Client = null;

var urlLogin = {
    scheme: "http",
    server: "localhost:3000",
    path: "api/login",
    email: "",
    token: ""
};

function Hash(email) {
    var hash = 0;
    if (email.length == 0) return hash;
    for (i = 0; i < email.length; i++) {
        char = email.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash;
    }
    return (hash<0)?hash*-1:hash;
}

//const fetchAuthConfig = () => fetch("./auth_config.json");

const configureClient = async () => {
    //const response = await fetchAuthConfig();
    //const config = await response.json();

    const config = {
        "domain": "dev-x02afyvyg3u7yzwq.us.auth0.com",
        "clientId": "k5qWLrTMU9wZzmG0BImZ9370dfKrpgva",
        "audience": "k5qWLrTMU9wZzmG0BImZ9370dfKrpgva"
      }

    auth0Client = await auth0.createAuth0Client({
        domain: config.domain,
        clientId: config.clientId
    });
};

const login = async () => {
    await auth0Client.loginWithRedirect({
        authorizationParams: {
            redirect_uri: window.location.origin
        }
    });
};

const logout = () => {
    auth0Client.logout({
        logoutParams: {
            returnTo: window.location.origin
        }
    });
    window.sessionStorage.removeItem('token')
    window.sessionStorage.removeItem('email')
    window.sessionStorage.removeItem('userId')
};

window.onload = async () => {
    await configureClient();

    updateUI();

    const isAuthenticated = await auth0Client.isAuthenticated();

    if (isAuthenticated) {
        // show the gated content
        return;
    }

    // NEW - check for the code and state parameters
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {

        // Process the login state
        let token = await auth0Client.handleRedirectCallback();

        let sessionData = await auth0Client.getIdTokenClaims()

        if (sessionData) {
            window.sessionStorage.setItem('token', sessionData.__raw)
            window.sessionStorage.setItem('email', sessionData.email)
            window.sessionStorage.setItem('userId', Hash(sessionData.email))
        }

        updateUI();

        // Use replaceState to redirect the user away and remove the querystring parameters
        window.history.replaceState({}, document.title, "/");
    }
}

const updateUI = async () => {
    const isAuthenticated = await auth0Client.isAuthenticated();

    document.getElementById("btn-logout").disabled = !isAuthenticated;
    document.getElementById("btn-login").disabled = isAuthenticated;

    // NEW - add logic to show/hide gated content after authentication
    if (isAuthenticated) {

        // let user = await auth0Client.getUser()
        // let token = await auth0Client.getTokenSilently()

        // urlLogin.email = user.name
        // urlLogin.token = token

        // await fetch(createURL(urlLogin), {
        //     method: "GET"
        // })

        // const data = await response.json()

    } 
};

function createURL({ scheme, server, path, ...queryParams }) {
    let url = `${scheme}://${server}/${path}`;
    let param = new URLSearchParams(getQueryParams(queryParams)).toString();
    if (param)
        url += "?" + param;
    return url;
};