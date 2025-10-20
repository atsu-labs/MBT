import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  
  // 管理画面
  route("admin", "routes/admin.tsx", [
    index("routes/admin._index.tsx"),
    route("cases", "routes/admin.cases._index.tsx"),
    route("cases/new", "routes/admin.cases.new.tsx"),
    route("cases/:id", "routes/admin.cases.$id.tsx"),
    route("cases/:id/edit", "routes/admin.cases.$id.edit.tsx"),
  ]),
  
  // モバイル閲覧画面
  route("mobile", "routes/mobile.tsx"),
] satisfies RouteConfig;
