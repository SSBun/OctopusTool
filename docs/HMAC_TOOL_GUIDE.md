# HMAC 签名工具 - 使用指南

## 功能概览

专业的 HMAC（Hash-based Message Authentication Code）签名工具，提供消息签名生成和验证功能，确保消息的完整性和真实性。

## 核心功能

### 1. 双标签设计
- **生成签名标签**: 使用密钥为消息生成 HMAC 签名
- **验证签名标签**: 验证消息的 HMAC 签名是否有效

### 2. 支持的哈希算法

| 算法 | 输出长度 | 安全性 | 性能 | 推荐度 |
|------|---------|--------|------|--------|
| **HMAC-MD5** | 128 位 | ⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ 不推荐 |
| **HMAC-SHA1** | 160 位 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ 不推荐 |
| **HMAC-SHA256** | 256 位 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ 强烈推荐 |
| **HMAC-SHA384** | 384 位 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ 高安全场景 |
| **HMAC-SHA512** | 512 位 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ 最高安全 |

### 3. 输出格式
- **Hex（十六进制）**: 常用格式，易于阅读和传输
- **Base64**: 更短的表示形式，适合 JSON 和 URL

### 4. 字符编码
- **UTF-8**: 标准编码，支持多语言（推荐）
- **Latin1**: 兼容 ASCII，用于特定场景

## 使用步骤

### 生成 HMAC 签名

1. **选择配置**
   - 哈希算法: 选择 **HMAC-SHA256**（推荐）
   - 输出格式: 选择 **Hex** 或 **Base64**
   - 字符编码: 选择 **UTF-8**

2. **输入密钥**
   - 在"密钥 (Secret Key)"字段输入密钥
   - 密钥应该足够长且随机（建议至少 32 字节）
   - ⚠️ **密钥必须保密，不要泄露！**

3. **输入消息**
   - 在"消息内容"框中输入要签名的消息
   - 可以是任何文本内容

4. **生成签名**
   - 点击 **"生成签名"** 按钮
   - HMAC 签名将显示在右侧"HMAC 签名"框中

5. **使用签名**
   - 点击 **"复制签名"** 复制到剪贴板
   - 点击 **"复制到验证"** 快速测试验证功能

### 验证 HMAC 签名

1. **切换到验证标签**
   - 点击顶部的 **"验证签名"** 标签

2. **输入相同配置**
   - 确保使用与生成时相同的哈希算法和输出格式

3. **输入验证数据**
   - 密钥: 输入与生成时相同的密钥
   - 消息内容: 输入原始消息
   - 待验证签名: 输入要验证的 HMAC 签名

4. **查看验证结果**
   - ✅ **绿色提示**: 签名验证成功，消息未被篡改
   - ❌ **红色提示**: 签名验证失败，消息可能被篡改或配置不匹配

## 工作原理

### HMAC 算法流程

```
HMAC(K, M) = H((K ⊕ opad) || H((K ⊕ ipad) || M))

其中：
- K = 密钥（Secret Key）
- M = 消息（Message）
- H = 哈希函数（如 SHA-256）
- opad = 外部填充（0x5c 重复）
- ipad = 内部填充（0x36 重复）
- ⊕ = 异或运算
- || = 连接运算
```

### 为什么 HMAC 是安全的？

1. **需要密钥**: 没有密钥无法生成有效签名
2. **单向性**: 无法从签名反推出消息或密钥
3. **抗碰撞**: 几乎不可能找到产生相同签名的不同消息
4. **抗篡改**: 消息或密钥的任何微小改变都会产生完全不同的签名

## 实际应用场景

### 1. API 签名验证
```
场景: 确保 API 请求来自可信客户端
流程:
1. 客户端使用密钥对请求参数生成 HMAC
2. 将 HMAC 作为签名随请求发送
3. 服务器使用相同密钥重新计算 HMAC
4. 比较两个 HMAC 是否一致
```

### 2. JWT（JSON Web Token）
```
场景: Token 签名，防止 Token 被篡改
结构: Header.Payload.Signature
签名: HMAC-SHA256(Header + "." + Payload, secret)
```

### 3. Webhook 签名
```
场景: 验证 Webhook 回调的真实性
示例（GitHub Webhooks）:
- GitHub 使用 HMAC-SHA256 签名 payload
- 密钥: Webhook secret
- 签名: 在 X-Hub-Signature-256 头中发送
```

### 4. 消息完整性校验
```
场景: 确保传输的数据未被篡改
应用:
- 文件下载验证
- 软件更新包验证
- 配置文件完整性检查
```

### 5. 密码存储增强
```
场景: 增强密码哈希的安全性
方法: HMAC(password, user_salt)
优点: 即使哈希被泄露，没有密钥也无法验证
```

## 安全最佳实践

### ✅ 推荐做法

1. **使用强密钥**
   - 密钥长度至少 32 字节（256 位）
   - 使用加密安全的随机数生成器
   - 不要使用简单或可猜测的密钥

2. **选择合适的哈希算法**
   - 优先使用 SHA-256 或更高
   - 避免使用 MD5 和 SHA-1
   - 考虑性能和安全性的平衡

3. **密钥管理**
   - 密钥永远不要硬编码在代码中
   - 使用环境变量或密钥管理服务
   - 定期轮换密钥
   - 不同场景使用不同密钥

4. **传输安全**
   - 使用 HTTPS 传输签名和数据
   - 不要在 URL 中包含密钥或签名
   - 使用安全的请求头传递签名

5. **时效性控制**
   - 在签名中包含时间戳
   - 设置签名有效期
   - 防止重放攻击

### ❌ 避免的做法

1. **不要使用弱密钥**
   - 不要使用短密钥（< 16 字节）
   - 不要使用可预测的密钥
   - 不要重复使用密码作为密钥

2. **不要使用不安全的算法**
   - MD5 已被证明存在碰撞漏洞
   - SHA-1 已不再安全
   - 优先使用 SHA-256 或更高

3. **不要泄露密钥**
   - 不要在前端代码中存储密钥
   - 不要通过日志输出密钥
   - 不要将密钥提交到版本控制

4. **不要忽略验证**
   - 始终验证接收到的签名
   - 不要信任未经验证的数据
   - 使用恒定时间比较防止时序攻击

## 代码示例

### JavaScript/Node.js
```javascript
const crypto = require('crypto');

// 生成 HMAC
function generateHMAC(message, key, algorithm = 'sha256') {
  const hmac = crypto.createHmac(algorithm, key);
  hmac.update(message);
  return hmac.digest('hex');
}

// 验证 HMAC
function verifyHMAC(message, key, signature, algorithm = 'sha256') {
  const expectedSignature = generateHMAC(message, key, algorithm);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// 使用示例
const key = 'mySecretKey123456';
const message = 'Hello, World!';
const signature = generateHMAC(message, key);
console.log('Signature:', signature);

const isValid = verifyHMAC(message, key, signature);
console.log('Valid:', isValid); // true
```

### Python
```python
import hmac
import hashlib

# 生成 HMAC
def generate_hmac(message, key, algorithm='sha256'):
    key_bytes = key.encode('utf-8')
    message_bytes = message.encode('utf-8')
    
    if algorithm == 'sha256':
        hash_func = hashlib.sha256
    elif algorithm == 'sha512':
        hash_func = hashlib.sha512
    else:
        hash_func = hashlib.sha1
    
    signature = hmac.new(key_bytes, message_bytes, hash_func)
    return signature.hexdigest()

# 验证 HMAC
def verify_hmac(message, key, signature, algorithm='sha256'):
    expected_signature = generate_hmac(message, key, algorithm)
    return hmac.compare_digest(expected_signature, signature)

# 使用示例
key = 'mySecretKey123456'
message = 'Hello, World!'
signature = generate_hmac(message, key)
print(f'Signature: {signature}')

is_valid = verify_hmac(message, key, signature)
print(f'Valid: {is_valid}')  # True
```

### API 签名示例
```javascript
// 客户端：生成 API 签名
function signRequest(params, apiSecret) {
  // 1. 参数排序
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  // 2. 添加时间戳
  const timestamp = Date.now();
  const message = `${sortedParams}&timestamp=${timestamp}`;
  
  // 3. 生成 HMAC 签名
  const signature = CryptoJS.HmacSHA256(message, apiSecret).toString();
  
  return {
    ...params,
    timestamp,
    signature
  };
}

// 服务器端：验证 API 签名
function verifyRequest(request, apiSecret) {
  const { signature, ...params } = request;
  
  // 1. 重建消息
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  // 2. 计算期望的签名
  const expectedSignature = CryptoJS.HmacSHA256(sortedParams, apiSecret).toString();
  
  // 3. 恒定时间比较
  return signature === expectedSignature;
}
```

## 常见问题

### Q: HMAC 和普通哈希有什么区别？
A: 
- **普通哈希**（如 SHA-256）：只对数据进行哈希，任何人都可以计算
- **HMAC**：需要密钥才能计算，只有持有密钥的人才能生成和验证

### Q: 为什么签名验证失败？
A: 常见原因：
- 密钥不一致
- 哈希算法不同
- 输出格式不匹配
- 消息内容被修改
- 字符编码不同
- 签名中有多余的空格或换行

### Q: 如何生成安全的密钥？
A: 
```javascript
// Node.js
const crypto = require('crypto');
const key = crypto.randomBytes(32).toString('hex'); // 64 字符的 Hex 字符串

// 浏览器
const array = new Uint8Array(32);
crypto.getRandomValues(array);
const key = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
```

### Q: HMAC 签名的长度是固定的吗？
A: 是的，签名长度由哈希算法决定：
- HMAC-MD5: 32 字符（Hex）/ 24 字符（Base64）
- HMAC-SHA1: 40 字符（Hex）/ 28 字符（Base64）
- HMAC-SHA256: 64 字符（Hex）/ 44 字符（Base64）
- HMAC-SHA512: 128 字符（Hex）/ 88 字符（Base64）

### Q: 可以用 HMAC 进行加密吗？
A: 不可以。HMAC 是用于消息认证的，不是加密算法：
- HMAC: 验证消息完整性和真实性，不隐藏内容
- 加密: 隐藏消息内容，使其不可读

### Q: 如何防止重放攻击？
A: 在消息中包含时间戳或 nonce：
```javascript
const timestamp = Date.now();
const nonce = generateRandomNonce();
const message = `${data}|${timestamp}|${nonce}`;
const signature = generateHMAC(message, key);

// 验证时检查时间戳是否在有效期内
const maxAge = 5 * 60 * 1000; // 5 分钟
if (Date.now() - timestamp > maxAge) {
  throw new Error('Signature expired');
}
```

## 性能优化

### 1. 选择合适的算法
- 高性能场景: SHA-256（平衡最佳）
- 高安全场景: SHA-512
- 避免: MD5、SHA-1

### 2. 批量处理
```javascript
// 不推荐：每次都创建新的 HMAC 对象
messages.forEach(msg => {
  const signature = CryptoJS.HmacSHA256(msg, key);
});

// 推荐：复用哈希上下文（如果库支持）
const hmac = crypto.createHmac('sha256', key);
messages.forEach(msg => {
  hmac.update(msg);
  const signature = hmac.digest('hex');
  hmac.reset(); // 重置状态
});
```

### 3. 缓存结果
```javascript
const cache = new Map();

function cachedHMAC(message, key) {
  const cacheKey = `${message}:${key}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const signature = generateHMAC(message, key);
  cache.set(cacheKey, signature);
  return signature;
}
```

## 技术实现

### 依赖库
- **crypto-js**: 纯 JavaScript 的加密库
- 支持所有常用的 HMAC 算法
- 可在浏览器和 Node.js 中运行

### 实现细节
```typescript
// 生成 HMAC
const hmacFunc = CryptoJS.HmacSHA256; // 或其他算法
const hmac = hmacFunc(message, key);
const signature = hmac.toString(CryptoJS.enc.Hex); // 或 Base64

// 验证 HMAC（防时序攻击）
const expected = generateHMAC(message, key);
const isValid = expected.toLowerCase() === signature.toLowerCase().trim();
```

## 更新日志

### v1.0.0 (当前版本)
- ✨ 支持 5 种 HMAC 算法
- ✨ 双标签设计（生成/验证）
- ✨ Hex 和 Base64 输出格式
- ✨ 自动验证功能
- ✨ 一键复制到验证
- ✨ 详细的使用说明
- ✨ 实时字符计数
- ✨ 示例数据快速加载
- ✨ 响应式设计

## 总结

HMAC 是一个强大且广泛使用的消息认证工具，适合：

- 🔐 **API 安全**: 签名和验证 API 请求
- 🎫 **Token 保护**: JWT、Session Token 签名
- 📨 **Webhook**: 验证回调请求的真实性
- 📦 **数据完整性**: 确保数据未被篡改
- 🔑 **密钥协商**: 安全的密钥交换协议

**记住三点**：
1. 密钥必须保密 🔒
2. 推荐使用 SHA-256 或更高 ✅
3. 始终验证签名 ✔️

**安全第一，验证必须！** 🛡️

