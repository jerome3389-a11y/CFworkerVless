/**
 * 1. UUID 配置：请修改为您自己的 UUID,地址后面加上UUID会返回Hello World!
 */
const k1 = 'xxxxxxxxxxxxxxxxxxxxxxxxxxx';

/**
 * 2. 跳转节点池：当直连失败或需要中转时使用的 ProxyIP 列表
 */
const p1 = ["google.com", "apple.com"];

/**
 * 3. 伪装网页：非 WebSocket 请求或非法访问将跳转至此域名
 */
const s1 = 'www.bing.com';

节点模板：
{
  "type": "vless",
  "tag": "CFworkerVless",
  "server": "替换为你的优选IP或域名",
  "server_port": 443,
  "uuid": "你的UUID",
  "packet_encoding": "", 
  "tls": {
    "enabled": true,
    "server_name": "你的Worker域名",
    "utls": {
      "enabled": true,
      "fingerprint": "chrome"
    }
  },
  "transport": {
    "type": "ws",
    "path": "/你的UUID",
    "headers": {
      "Host": "你的Worker域名"
    }
  }
}
