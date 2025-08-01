# 登录系统UI设计规范

**版本:** 1.0
**日期:** 2025-07-31

## 1. 设计原则

1.  **一致性:** 所有新增界面和组件的视觉风格、布局、字体、颜色和交互行为必须与现有项目（基于 `shadcn/ui`）保持一致。
2.  **清晰性:** 界面布局清晰，信息传达明确，用户能够轻松理解如何操作。
3.  **反馈性:** 用户的每一个操作都应有即时、明确的视觉反馈（如加载状态、成功提示、错误信息）。
4.  **易用性:** 简化操作流程，减少用户的输入和思考成本。

## 2. 组件使用指南

所有界面应优先复用 `components/ui/` 目录下的现有 `shadcn/ui` 组件。

### 2.1 登录页面 (`/login`)

- **布局:** 页面垂直居中，包含一个卡片式（`Card`）表单区域。
- **卡片 (`Card`):**
  - `CardHeader`: 显示标题“欢迎回来”和副标题“登录您的呈尚策划工具箱账户”。
  - `CardContent`: 包含表单元素。
  - `CardFooter`: 包含主操作按钮（登录）。
- **表单 (`Form`):**
  - 使用 `react-hook-form` 和 `zod` 集成 `Form` 组件。
  - **输入框 (`Input`):**
    - 用户名输入框，左侧可配 `User` 图标。
    - 密码输入框，左侧可配 `Lock` 图标，右侧提供可切换的可见/隐藏图标。
  - **标签 (`Label`):** 用于输入框的明确标识。
  - **复选框 (`Checkbox`):** 用于“记住密码”和“自动登录”。
  - **按钮 (`Button`):**
    - 主按钮“登录”，宽度充满父容器。
    - 在加载状态时，按钮应显示 `Loader` 图标并禁用。
- **提示 (`Alert` / `Sonner`):**
  - 使用 `Alert` 组件在表单内部显示登录失败的错误信息（如“用户名或密码错误”）。
  - 使用 `sonner` 在右上角弹出全局成功或失败提示。

### 2.2 后台管理页面 (`/admin`)

- **布局:** 沿用主应用的 `Header` + `Sidebar` + `Main` 布局。
- **数据表格 (`Table`):**
  - 用于展示用户列表。
  - 表头应包括：用户名、角色、状态、创建时间、最后登录时间、操作。
  - **角色列:** 使用 `Badge` 组件显示“管理员”或“用户”。
  - **状态列:** 使用带颜色的 `Badge`（如绿色表示“启用”，灰色表示“禁用”）或 `Switch` 开关。
  - **操作列:**
    - 使用 `DropdownMenu` 将多个操作（编辑、重置密码、删除）收纳到一个“操作”按钮中，保持界面整洁。
    - `DropdownMenuItem` 应包含图标和文字。
- **对话框 (`Dialog`):**
  - **新增/编辑用户:** 使用 `Dialog` 组件承载表单。
  - **删除确认:** 使用 `AlertDialog` 组件进行二次确认，防止误操作。`AlertDialogAction` 按钮应为警示色（如红色）。
- **统计卡片 (`Card`):**
  - 用于展示数据统计，样式参考主页的 `StatsCards` 组件。
  - 可使用 `recharts`（项目已引入）展示简单的图表。

### 2.3 Header 组件改造

- **用户头像/菜单 (`Avatar` & `DropdownMenu`):**
  - 登录后，`Avatar` 组件应显示用户名的首字或用户设置的头像。
  - `DropdownMenu` 中应显示当前登录用户的用户名和角色。
  - “退出登录” `DropdownMenuItem` 应使用警示色（红色），并配有 `LogOut` 图标。

## 3. 视觉规范

- **颜色:**
  - **主色调:** 沿用项目现有的蓝色和紫色渐变主题。
  - **成功:** 绿色 (e.g., `bg-green-500`)
  - **警告/错误:** 红色 (e.g., `bg-rose-500`, `text-rose-500`)
  - **中性/禁用:** 灰色 (e.g., `bg-gray-500`, `text-gray-400`)
- **字体:**
  - 沿用 `GeistSans` 和 `GeistMono` 字体。
  - 标题、正文、标签的字号和字重需与现有应用保持一致。
- **间距与对齐:**
  - 遵循 `tailwind.config.ts` 中定义的间距规范 (e.g., `p-4`, `space-y-4`)。
  - 保持元素在垂直和水平方向上的对齐。

## 4. 交互状态

- **加载中 (Loading):**
  - 页面级加载：可使用 `Skeleton` 组件作为占位符。
  - 组件级加载（如按钮）：在按钮内显示 `Loader2` 图标并禁用按钮。
- **禁用 (Disabled):**
  - 表单元素和按钮在不满足条件或正在提交时应有明确的禁用样式。
- **悬停 (Hover) / 聚焦 (Focus):**
  - 所有可交互元素都应有清晰的 `hover` 和 `focus` 状态，利用 `shadcn/ui` 的内置样式。

---
**设计示例 (伪代码/结构):**

**登录页:**
```html
<div class="flex items-center justify-center h-screen">
  <Card class="w-[380px]">
    <CardHeader>...</CardHeader>
    <CardContent>
      <Form>
        <FormField name="username">
          <Input placeholder="用户名" />
        </FormField>
        <FormField name="password">
          <Input type="password" placeholder="密码" />
        </FormField>
        <div class="flex justify-between">
          <Checkbox>记住密码</Checkbox>
          <Checkbox>自动登录</Checkbox>
        </div>
      </Form>
    </CardContent>
    <CardFooter>
      <Button class="w-full">登录</Button>
    </CardFooter>
  </Card>
</div>
```
