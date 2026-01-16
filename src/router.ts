import 'reflect-metadata'; // Required for Reflect.getMetadata to work
import type { Context, Next } from 'koa';
import Koa from 'koa';
import { ControllerMetadata, METADATA_KEYS, ParamMetadata, paramsControlType } from './types';
import { container } from './container';
import { RouterInstance } from '@koa/router';

/**
 * 注册所有控制器到 Koa 实例
 * @param app Koa 实例
 * @param paramsControl 依赖注入配置项
 */

export function registerControllers(app: Koa, paramsControl: paramsControlType): void {
    const router = paramsControl.router as RouterInstance;
    const controllers = paramsControl.controllers;
    // 遍历所有控制器
    // console.log('注册的控制器和路由信息:');
    controllers.map((controllerClass) => {
        // 获取控制器元数据
        const controllerMeta = Reflect.getMetadata(METADATA_KEYS.CONTROLLER, controllerClass) as ControllerMetadata;
        if (!controllerMeta) {
            console.error(`未找到控制器元数据: ${controllerClass.name}`);
            return;
        }
        // 调试：打印控制器元数据
        // console.log('控制器元数据:', Reflect.getMetadata(METADATA_KEYS.CONTROLLER, controllerClass));

        // 从 DI 容器解析控制器实例
        const controllerInstance: any = container.resolve(controllerClass);

        // 按路由路径长度排序，确保更具体的路由优先注册
        controllerMeta.routes.sort((a, b) => a.path.length - b.path.length);

        // 遍历控制器的所有路由
        // console.log(`控制器: ${controllerClass.name}, 路由前缀: ${controllerMeta.prefix}`);
        // console.log("controllerMeta",controllerMeta)
        controllerMeta.routes.map((route) => {
            // console.log(`  路由: [${route.method}] ${controllerMeta.prefix}${route.path}`);
            const fullPath = `${controllerMeta.prefix}${route.path}`;
            // 注册路由到 Koa Router
            (router as any)[route.method.toLowerCase()](fullPath, async (ctx: Context, next: Next) => {
                // console.log(`进入控制器方法: ${route.handlerName}`);
                // 获取当前路由方法的参数元数据
                const paramsMeta =
                    (Reflect.getMetadata(
                        METADATA_KEYS.PARAMS,
                        controllerClass,
                        route.handlerName
                    ) as ParamMetadata[]) || [];

                // 解析参数（按索引排序）
                const args = new Array(paramsMeta.length).fill(undefined);
                // oxlint-disable-next-line max-nested-callbacks
                paramsMeta.map((meta) => {
                    args[meta.index] = resolveParam(ctx, next, meta);
                });

                // 执行控制器方法并返回结果

                ctx.body = await controllerInstance[route.handlerName](...args);
            });
        });
    });
    // console.log('所有控制器和路由注册完成。',router);
    // 将路由中间件注册到 Koa
    app.use(router.routes());
    app.use(router.allowedMethods());
}

/**
 * 根据参数元数据解析具体参数值
 */
function resolveParam(ctx: Context, next: any, meta: ParamMetadata): any {
    switch (meta.type) {
        case 'QUERY':
            return meta.key ? ctx.query[meta.key] : ctx.query;
        case 'BODY':
            const body = ctx.request.body as Record<string, any>;
            return meta.key ? body[meta.key] : body;
        case 'PARAM':
            return meta.key ? ctx.params[meta.key] : ctx.params;
        case 'CTX':
            return ctx;
        case 'NEXT':
            return next;
        default:
            return undefined;
    }
}
