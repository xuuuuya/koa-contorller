# koa-contorller

# 一个基于Koa的简单依赖注入器

### 示例
###### 下载：
``` zsh
npm i -D koa-controller
```
###### 使用：
```typescript
import { Context } from 'koa';
import { KoaContainerApp, Controller, Get, Post, Query, Body, Param, Ctx, Service } from 'koa-controller'; // 引入 Service 装饰器
import bodyParser from "koa-bodyparser";
@Service() // 默认单例，等价于 @Service('singleton')
class UserService {
    private users = [
        { id: 1, name: '张三' },
        { id: 2, name: '李四' }
    ];

    // 获取所有用户
    getUsers () {
        return this.users;
    }

    // 根据 ID 获取用户
    getUserById ( id: number ) {
        return this.users.find( ( u ) => u.id === id );
    }

    // 创建用户
    createUser ( user: { name: string } ) {
        const newUser = { id: this.users.length + 1, ...user };
        this.users.push( newUser );
        return newUser;
    }
}

// -------------------------- 示例：定义控制器 --------------------------
@Controller( '/users' ) // 路由前缀
class UserController {
    // 从 DI 容器自动注入 UserService
    constructor ( private userService: UserService ) {
    }

    // GET /users
    @Get( '/' )
    getUsers () {
        console.log( '获取用户列表' );
        return this.userService.getUsers();
    }

    // GET /users/:id
    @Get( '/:id' )
    getUserById ( @Param( 'id' ) id: string, @Ctx() ctx: Context ) {
        // 解析参数并调用服务
        const user = this.userService.getUserById( Number( id ) );
        if ( !user ) {
            ctx.status = 404;
            return { message: '用户不存在' };
        }
        return user;
    }

    // POST /users
    @Post( '/' )
    createUser ( @Body() body: { name: string } ) {
        return this.userService.createUser( body );
    }
}

const app = new KoaContainerApp();
app.use(bodyParser())
app.registerControllers( {
    controllers: [ UserController ]
} );
const port = 3000;
app.listen( port, () => {
    console.log( 'http://localhost:' + port );
} );


```
