var submit = document.getElementById("form-submit");
var error = document.getElementById("text-error-tm")

submit.addEventListener("submit", function(event){
    event.preventDefault();
    console.log("DFdsads")
    var subiect = document.getElementById("subiect-input").value
    var message = document.getElementById("message-input").value
    var hours = document.getElementById('hours');
    var hoursValue = hours.options[hours.selectedIndex].value;
    var minutes = document.getElementById('minutes');
    var minutesValue = minutes.options[minutes.selectedIndex].value;
    var type = document.getElementById('type');
    var typeValue = type.options[type.selectedIndex].value;
    
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            window.location.replace("/forum");
        }

        if (this.status == 204) {
            error.textContent = " Subiectul sau mesajul nu este specificat. "
        }
    };
    xhttp.open("POST", `/post`, true);
    xhttp.setRequestHeader('Access-Control-Expose-Headers','Set-Cookie');
    var data = {subiect: subiect, message: message, type: typeValue, hours: hoursValue, minutes: minutesValue};
    xhttp.send(JSON.stringify(data));
});

function getLastPart(str) {
    var tmp = str.split('/');
    return tmp[tmp.length - 1]
}

var prof  = getLastPart(window.location.href)
var regex = /[1-9]\d*$/
if(prof.match(regex)){
    var match = prof.match(regex)
    insertPosts(match[0]);
}else{
    insertPosts();
}

function insertPosts(id = undefined){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var target = document.getElementById("insert-posts");
            var response = JSON.parse(this.response);
            if(response.results){
                for(var i = 0; i < response.results.length; i++){
                    target.innerHTML += '<dt>' + response.results[i].subject + '</dt>'
                    target.innerHTML += '<dd>' + response.results[i].message + '</dd>'
                }
                if(response.submit === false){
                    var doc = document.getElementById("formwrap");
                    doc.style.display = "none";
                }
            }else{
                target.innerHTML += '<dt> NO POSTS AVAILABLE </dt>'
                target.innerHTML += '<dd> Expand by creating a post </dd>'
            }
        }
    };
    if(id === undefined){
        xhttp.open("GET", `/getPosts`, true);
    }else{
        xhttp.open("GET", `/post/${id}`, true);
    }
    xhttp.setRequestHeader('Access-Control-Expose-Headers','Set-Cookie');
    xhttp.send();
}
