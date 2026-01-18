import 'reflect-metadata';
import { container } from './container'; // 引入容器实例
import { METADATA_KEYS, RouteMetadata, ParamMetadata, ParamType, ServiceMetadata, Scope } from './types';

/**
 * 服务装饰器：标记类为服务，自动注册到 DI 容器
 * @param scope 作用域（默认 singleton 单例）
 */
export function Service(scope: Scope = 'singleton'): ClassDecorator {
    return (target: any) => {
        // 存储服务元数据
        const serviceMeta: ServiceMetadata = { scope };
        Reflect.defineMetadata(METADATA_KEYS.SERVICE, serviceMeta, target);

        // 自动注册到 DI 容器（核心：替代手动 register）
        container.register(target, target, scope);
    };
}

/**
 * 控制器装饰器：标记类为控制器，指定路由前缀
 * @param prefix 路由前缀，如 '/user'
 */
export function Controller(prefix: string): ClassDecorator {
    return (target) => {
        // 合并已有的元数据，确保不覆盖路由信息
        const existingMeta = Reflect.getMetadata(METADATA_KEYS.CONTROLLER, target) || { prefix: '', routes: [] };
        const mergedMeta = {
            ...existingMeta,
            prefix,
            routes: existingMeta.routes || []
        };
        Reflect.defineMetadata(METADATA_KEYS.CONTROLLER, mergedMeta, target);
    };
}

/**
 * HTTP GET 装饰器
 * @param path 路由路径，如 '/:id'
 */
export function Get(path: string): MethodDecorator {
    return createMethodDecorator('GET', path);
}

/**
 * HTTP POST 装饰器
 * @param path 路由路径
 */
export function Post(path: string): MethodDecorator {
    return createMethodDecorator('POST', path);
}

/**
 * HTTP PUT 装饰器
 * @param path 路由路径
 */
export function Put(path: string): MethodDecorator {
    return createMethodDecorator('PUT', path);
}

/**
 * HTTP DELETE 装饰器
 * @param path 路由路径
 */
export function Delete(path: string): MethodDecorator {
    return createMethodDecorator('DELETE', path);
}
/**
 * HTTP PATCH 装饰器
 * @param path 路由路径
 */
export function Patch(path: string): MethodDecorator {
    return createMethodDecorator('PATCH', path);
}

/**
 * 通用 HTTP 方法装饰器创建函数
 */
function createMethodDecorator(method: RouteMetadata['method'], path: string): MethodDecorator {
    return (target, propertyKey) => {
        // const controllerClass = target.constructor.constructor;
        const controllerClass = target.constructor;
        // 获取已有的控制器元数据
        const controllerMeta = Reflect.getMetadata(METADATA_KEYS.CONTROLLER, controllerClass) || {
            prefix: '',
            routes: []
        };
        // console.log("path",path)
        if (path === '/') path = ''; // 兼容性处理
        // 添加路由元数据
        const routeMeta: RouteMetadata = {
            path,
            method,
            handlerName: propertyKey.toString()
        };
        // console.log('正在添加路由元数据:', routeMeta);
        // console.log('更新前的控制器元数据:', controllerMeta);
        controllerMeta.routes.push(routeMeta);
        // 更新控制器元数据
        Reflect.defineMetadata(METADATA_KEYS.CONTROLLER, controllerMeta, controllerClass);
    };
}

/**
 * Query 参数装饰器：解析 ctx.query 中的参数
 * @param key 可选，指定具体的 query 键，如 @Query('id')
 */
export function Query(key?: string): ParameterDecorator {
    return createParamDecorator('QUERY', key);
}

/**
 * Body 参数装饰器：解析 ctx.request.body 中的参数
 * @param key 可选，指定具体的 body 键
 */
export function Body(key?: string): ParameterDecorator {
    return createParamDecorator('BODY', key);
}

/**
 * Param 参数装饰器：解析 ctx.params 中的参数
 * @param key 可选，指定具体的 param 键
 */
export function Param(key?: string): ParameterDecorator {
    return createParamDecorator('PARAM', key);
}

/**
 * Ctx 装饰器：注入 Koa Context
 */
export function Ctx(): ParameterDecorator {
    return createParamDecorator('CTX');
}

/**
 * Next 装饰器：注入 Koa Next 函数
 */
export function Next(): ParameterDecorator {
    return createParamDecorator('NEXT');
}

/**
 * 通用参数装饰器创建函数
 */
function createParamDecorator(type: ParamType, key?: string): ParameterDecorator {
    return (target, propertyKey: any, parameterIndex) => {
        const controllerClass = target.constructor;
        // 获取已有的参数元数据
        const paramsMeta: ParamMetadata[] =
            Reflect.getMetadata(METADATA_KEYS.PARAMS, controllerClass, propertyKey) || [];
        // console.log("paramsMeta",paramsMeta)
        // 添加参数元数据
        paramsMeta.push({
            index: parameterIndex,
            type,
            key
        });
        // console.log("paramsMeta",paramsMeta)

        // 更新参数元数据
        Reflect.defineMetadata(METADATA_KEYS.PARAMS, paramsMeta, controllerClass, propertyKey);
    };
}
