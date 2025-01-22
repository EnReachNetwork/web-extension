import forge from "node-forge";

export function signWithPrivateKey(privateKeyPem: string, message: string) {
    const privateKey = forge.pki.privateKeyFromPem(Buffer.from(privateKeyPem, "base64").toString("utf-8"));
    const md = forge.md.sha256.create();
    md.update(message, "utf8");
    const signature = privateKey.sign(md);
    return forge.util.encode64(signature); // 返回 base64 编码的签名
}
