
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["account"], (result) => {
    if (result.account) {
      document.getElementById("cookieName").value = result.account;
    }
  });

  chrome.storage.local.get(["password"], (result) => {
    if (result.password) {
      document.getElementById("cookieValue").value = result.password;
    }
  });

});



document.getElementById("setCookie").addEventListener("click", () => {
  let time = Date.now()
  let url = document.getElementById("url").value.trim();
  url = url + time;
  let name = document.getElementById("cookieName").value.trim();
  let value = document.getElementById("cookieValue").value.trim();
  let expires = document.getElementById("expires").value.trim();

  const loginBtn = document.getElementById("setCookie");
  const loadingIcon = document.getElementById("loadingIcon");
  const statusText = document.getElementById("status");


  if (!name || !value) {
    statusText.innerText = "请输入账号或密码！";
    statusText.style.color = "red";
    return;
  }

  // 显示动画
  loginBtn.disabled = true;
  loadingIcon.style.display = "inline-block";
  statusText.innerText = "正在登录，请稍候...";
  statusText.style.color = "#666";

/*  if (!url || !name || !value || isNaN(expires)) {
    document.getElementById("status").innerText = "请填写所有字段！";
    return;
  }*/

  let domain = new URL(url).hostname;

  chrome.runtime.sendMessage({
    action: "setCookie",
    url,
    name,
    value,
    domain,
    expires,
    time
  }, (response) => {
    loginBtn.disabled = false;
    loadingIcon.style.display = "none";

    if (response.success) {
      document.getElementById("status").innerText = "✅ 登陆成功！";
    } else {
      if (response.error.includes("Failed to fetch")){
        response.error = "服务器宕机了,等待作者修复吧~"
      }
      document.getElementById("status").innerText = "❌ 失败: " + response.error;
    }
  });
});
