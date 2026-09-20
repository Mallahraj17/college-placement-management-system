# 🚀 CPMS Kubernetes Deployment

This repository contains Kubernetes manifests for deploying a **CPMS (College Project Management System)** application consisting of:
- **Frontend** (React + Vite + Nginx)
- **Backend** (Node.js + Express + Mongoose)
- **MongoDB** (StatefulSet with persistent storage)

---

## 🗂 Folder Structure

```
kubernetes/
├── namespace.yaml
├── kind-config.yaml
├── mongo-configmap.yaml
├── mongo-secret.yaml
├── mongo-statefulset.yaml
├── mongo-service.yaml
├── backend-config.yaml
├── backend-secret.yaml
├── backend-deployment.yaml
├── backend-service.yaml
├── frontend-config.yaml
├── frontend-deployment.yaml
├── frontend-service.yaml
```

---

## ⚙️ Create Kubernetes Cluster (Kind)

```bash
kind create cluster --name cpms-cluster --config kind-config.yaml
```

Access frontend via:
```
http://<EC2-IP>:30080
```

---

## 🧩 Create Namespace

```bash
kubectl apply -f namespace.yaml
kubectl get ns
```

---

## 🗝 Deploy MongoDB

```bash
kubectl apply -f mongo-configmap.yaml -f mongo-secret.yaml -f mongo-statefulset.yaml -f mongo-service.yaml
kubectl get pods -n cpms
```

---

## 🧠 Deploy Backend

Build Raj's local images from the repository root and load them into the Kind cluster before deploying:

```bash
docker build -t cpms-backend:raj ./backend
docker build -t cpms-frontend:raj ./frontend
kind load docker-image cpms-backend:raj cpms-frontend:raj --name cpms-cluster
```

Then run the following commands from the kubernetes directory. These image tags refer to local builds, not a published registry.

```bash
kubectl apply -f backend-config.yaml -f backend-secret.yaml -f backend-deployment.yaml -f backend-service.yaml
kubectl get pods -n cpms
kubectl logs -n cpms deployment/backend
```

---

## 🌐 Deploy Frontend

```bash
kubectl apply -f frontend-config.yaml -f frontend-deployment.yaml -f frontend-service.yaml
kubectl get svc -n cpms
```

Access:
```
http://<EC2-IP>:30080
```

---

## 🔁 Update or Restart Deployments

```bash
kubectl apply -f backend-config.yaml -f backend-secret.yaml
kubectl rollout restart deployment backend -n cpms
kubectl apply -f frontend-config.yaml
kubectl rollout restart deployment frontend -n cpms
```

---

## 🧾 Verify Communication

```bash
kubectl logs -f -n cpms deployment/backend
```

1. Open frontend (`http://<EC2-IP>:30080`)
2. Test login or API call
3. Check backend logs

---

## 🧰 Troubleshooting

| Issue                          | Fix                                                 |
| ------------------------------ | --------------------------------------------------- |
| Backend can't connect to Mongo | Use `mongo-0.mongo.cpms.svc.cluster.local:27017`    |
| 504 or timeout                 | Verify backend service name and port                |
| NodePort not accessible        | Check Kind port mapping / EC2 SG rules              |
| Config changes not applied     | `kubectl rollout restart deployment <name> -n cpms` |

---

## 🧹 Delete All Resources

```bash
kubectl delete ns cpms
```

---
