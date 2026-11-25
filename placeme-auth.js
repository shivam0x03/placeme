(() => {
const $ = id => document.getElementById(id);
const cfg = window.PLACEME_AUTH || {};
const client = cfg.url && cfg.publishableKey && window.supabase ? window.supabase.createClient(cfg.url,cfg.publishableKey) : null;
let mode = "login", pending = null, busy = false, lastSent = 0;
function notice(message, error=false) {
 const el = $(mode==="signup"?"signupNotice":"notice"); el.textContent=message; el.className="notice show "+(error?"warn":"info");
}
function setMode(next) {
 mode=next; pending=null; const signup=next==="signup";
 $("loginForm").hidden=signup; $("signupForm").hidden=!signup;
 $("signInTab").classList.toggle("active",!signup); $("signUpTab").classList.toggle("active",signup);
 $("signInTab").setAttribute("aria-selected",String(!signup)); $("signUpTab").setAttribute("aria-selected",String(signup));
 $("loginTitle").textContent=signup?"Create your account":"Welcome back";
 $("loginIntro").textContent=signup?"Enter your details and verify your mobile number.":"Sign in with a one-time code sent to your phone.";
 for(const id of ["otpBox","signupOtpBox","verifyButton"]) $(id).classList.remove("show");
 for(const id of ["notice","signupNotice"]) $(id).className="notice";
}
function number() {
 const signup=mode==="signup", country=$(signup?"signupCountry":"countryCode").value, raw=$(signup?"signupPhone":"phone").value.trim();
 if (!/^[0-9\s()-]+$/.test(raw)) throw Error("Enter your national mobile number without the country code.");
 const n=raw.replace(/\D/g,""), p=country+n;
 if(country==="+91"&&!/^[6-9]\d{9}$/.test(n)) throw Error("Enter a valid 10-digit Indian mobile number.");
 if(!/^\+[1-9]\d{7,14}$/.test(p)) throw Error("Enter a valid mobile number.");
 return p;
}
async function run(action) {
 if(busy)return; busy=true;
 const controls=[...document.querySelectorAll("form button,.auth-tab")]; controls.forEach(b=>b.disabled=true);
 try {if(!client)throw Error("Authentication is not configured yet. Add the Supabase project URL and publishable key."); await action();}
 catch(e){notice(e.message||"Authentication failed.",true);}
 finally{busy=false;controls.forEach(b=>b.disabled=false);}
}
async function send() {
 const phone=number(), signup=mode==="signup";
 const email=$("signupEmail").value.trim(), city=$("signupCity").value==="Other"?$("otherCity").value.trim():$("signupCity").value;
 if(signup&&(!email||!$("signupEmail").checkValidity()||!city))throw Error("Enter a valid email address and city.");
 if(Date.now()-lastSent<60000)throw Error("Please wait 60 seconds before requesting another code.");
 pending=null;
 const {error}=await client.auth.signInWithOtp({phone,options:{shouldCreateUser:signup,...(signup?{data:{contact_email:email,city}}:{})}});
 if(error)throw error;
 lastSent=Date.now();pending={phone,mode};
 $(signup?"signupOtpBox":"otpBox").classList.add("show");
 if(!signup)$("verifyButton").classList.add("show");
 notice("Code requested. Enter the SMS code to continue.");$(signup?"signupOtp":"otp").focus();
}
async function verify(){
 if(!pending||pending.mode!==mode||pending.phone!==number())throw Error("Request a new code for this number first.");
 const token=$(mode==="signup"?"signupOtp":"otp").value.trim();
 if(!/^\d{6}$/.test(token))throw Error("Enter the six-digit code.");
 const {data,error}=await client.auth.verifyOtp({phone:pending.phone,token,type:"sms"});
 if(error)throw error;
 if(!data.session)throw Error("No authenticated session returned.");
 pending=null;location.assign("PLACEME-account.html");
}
for(const id of ["sendOtp","resendOtp","sendSignupOtp","resendSignupOtp"]) $(id).addEventListener("click",()=>run(send));
for(const id of ["verifyButton","createAccount"]) $(id).addEventListener("click",()=>run(verify));
$("signInTab").addEventListener("click",()=>setMode("login"));
$("signUpTab").addEventListener("click",()=>setMode("signup"));
$("signupCity").addEventListener("change",e=>$("otherCity").hidden=e.target.value!=="Other");
for(const id of ["loginForm","signupForm"]) $(id).addEventListener("submit",e=>{e.preventDefault();run(pending?verify:send);});
setMode("login");
})();