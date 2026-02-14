修改项目时的参考文档: (禁止修改当前文件)

- 请求使用工具类@/utils/http.ts来发送。http工具类在全局层面统一处理所有业务错误和异常（包括错误提示、日志记录等），因此在调用API时不需要添加try-catch来处理业务错误，只在特定业务逻辑需要时（如用户交互确认、条件判断）才使用try-catch。
- 项目使用tailwindcss，优先使用tailwindcss的utility classes，尽量避免使用原生CSS。
- 公共组件定义在@/components。
- api目录按角色划分（admin、merchant等），公共api函数和类型定义放在common目录中。
- 发送请求时，通过@/api/client.ts提供的getAdminApi()或getMerchantApi()获取对应角色的API客户端。
- API请求函数的请求路径需要遵循RESTful设计规范。
- 所有请求会自动加上角色前缀（如/admin、/merchant等），因此定义API函数时只需提供去掉前缀的路径。
- 进行代码重构时，不需要生成详细的改动文档，只需用简洁的语言说明主要改动内容。
- 项目使用Pinia作为状态管理框架。
- 不需要创建重构文档, 直接说明重构内容
