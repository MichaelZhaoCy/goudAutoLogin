chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "setCookie") {
        fetch("http://112.74.56.134:35365/", {
            method: "POST",
            body: encodeURIComponent("UserName="+request.name+"&PassWord="+request.value)
        })
            .then(response => response.text())
            .then(data => {
                if (data === "Error,the slider is not completed,try a later." || data === ""){
                    throw new Error("服务器内部错误!解决方案:等待作者修复")
                }
                if (data === "Error,UserName or Password is not correct,please check it and try it later!"){
                    throw new Error("账号或密码错误,检查后重试")
                }

                let SID = getStringBetween(data,"JSESSIONID=",";")
                let key = getStringBetween(data,"; ","=")
                let value = getStringAfter(data,key+"=")


                chrome.cookies.set({
                    url: "https://jw.gdou.edu.cn/xtgl/login_slogin.html",
                    name: "JSESSIONID",
                    value: SID,  // 服务器返回的 sessionID
                    path: "/",
                    httpOnly: true
                }, (cookie1) => {
                    if (chrome.runtime.lastError) {
                        sendResponse({ success: false, error: chrome.runtime.lastError });
                        return;
                    }

                    chrome.cookies.set({
                        url: "https://jw.gdou.edu.cn/xtgl/login_slogin.html",
                        name: key,
                        value: value,  // 服务器返回的 cookie
                        path: "/",
                        expirationDate: new Date().setHours(new Date().getHours() + 2)//Date.parse(data.expires) / 1000
                    }, (cookie2) => {
                        if (chrome.runtime.lastError) {
                            sendResponse({ success: false, error: chrome.runtime.lastError });
                            return;
                        }

                        chrome.storage.local.set({ account: request.name }, () => {
                            console.log("数据已保存！");
                        });
                        chrome.storage.local.set({ password: request.value }, () => {
                            console.log("数据已保存！");
                        });


                        chrome.tabs.create({ url: "https://jw.gdou.edu.cn/xtgl/login_slogin.html" });

                        sendResponse({ success: true, cookies: [cookie1, cookie2] });
                    });
                });
            })
            .catch(error => sendResponse({ success: false, error: error.toString() }));

        return true; // 让 `sendResponse()` 在异步操作完成后再调用


/*        chrome.cookies.set({
            url: "https://jw.gdou.edu.cn/xtgl/login_slogin.html",
            name: "JSESSIONID",
            value: request.name,
            path: "/",
            httpOnly: true
        }, (cookie) => {
            if (chrome.runtime.lastError) {
                sendResponse({ success: false, error: chrome.runtime.lastError });
            } else {
                sendResponse({ success: true, cookie });
            }
        }),
        chrome.cookies.set({
                    url: "https://jw.gdou.edu.cn/xtgl/login_slogin.html",
                    name: "ADCCookie-47873-sg_210.38.137.108",
                    value: request.value,
                    path: "/",
                    expirationDate: Date.parse(request.expires) / 1000
                }
        , (cookie) => {
            if (chrome.runtime.lastError) {
                sendResponse({ success: false, error: chrome.runtime.lastError });
            } else {
                sendResponse({ success: true, cookie });
                chrome.tabs.create({ url: "https://jw.gdou.edu.cn/xtgl/login_slogin.html" });
            }
        })*/

        return true;
    }
});
function getStringBetween(str, start, end) {
    let regex = new RegExp(`${start}(.*?)${end}`);
    let match = str.match(regex);
    return match ? match[1] : null;
}
function getStringAfter(str, keyword) {
    let index = str.indexOf(keyword);
    if (index === -1) return null; // 关键字不存在，返回 null
    return str.substring(index + keyword.length);
}