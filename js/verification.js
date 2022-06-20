var button = document.getElementById("submit-form");
var elements = document.getElementsByClassName("verification-display");
var checkpoints = document.getElementsByClassName("checkpoint");
var error = document.getElementById("errorMessage");
var verification = false;
var hold = null;

window.getCookie = function(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
}

if(window.getCookie('token')){
    window.location.replace("./forum");
}

button.addEventListener("click", function(event){

    if(verification == true){
        var code = document.getElementById('verificationField').value;

        if(code == ""){
            document.getElementById("errorMessage").textContent = "Codul nu a fost specificat.";
            return false;
        }else{
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    verification = true;
                    document.cookie = "token="+ (JSON.parse(this.responseText)).token;
                    window.location.replace("./forum");
                }
                if(this.status == 404){
                    document.getElementById("errorMessage").textContent = "Codul nu este corect.";
                }
            };
            xhttp.open("GET", `/user/code=${code}`, true);
            xhttp.setRequestHeader('emailuser', hold);
            xhttp.setRequestHeader('Access-Control-Expose-Headers','Set-Cookie');
            xhttp.send();
        }
    }else{
        var email = document.getElementById('verificationField').value;
        if(email == ""){
            document.getElementById("errorMessage").textContent = "Email-ul nu a fost specificat.";
            return false;
        }else{
            document.getElementById("errorMessage").textContent = "";
            document.getElementById('verificationField').value = "";
        
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    verification = true;
                    Array.from(elements).forEach(element => {
                        element.classList.remove("hidden");
                    });
                    Array.from(checkpoints).forEach(element => {
                        element.classList.add("hidden");
                    });
                }
                if(this.status == 404){
                    document.getElementById("errorMessage").textContent = "Email-ul nu a fost specificat.";
                }
            };

            
            hold = email;
            xhttp.open("GET", `/user/email=${email}`, true);
            xhttp.setRequestHeader('emailuser', hold);
            xhttp.send();
        }
    }
});
