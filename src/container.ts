import 'reflect-metadata';
import { DependencyItem, Scope, ControllerType } from './types';

/**
 * 原生依赖注入容器
 * 支持单例/瞬态作用域，自动解析构造函数依赖
 * 新增：支持解析未显式注册的类（如控制器）
 */
export class Container {
    // 依赖注册表
    private registry: Map<string | symbol | Function, DependencyItem> = new Map();

    /**
     * 注册依赖
     * @param provide 依赖标识（类/字符串/Symbol）
     * @param useClass 实现类
     * @param scope 作用域（默认单例）
     */
    register<T>(
        provide: string | symbol | ControllerType,
        useClass: new (...args: any[]) => T,
        scope: Scope = 'singleton'
    ): void {
        this.registry.set(provide, { provide, useClass, scope });
    }

    /**
     * 解析依赖（递归解析构造函数的依赖）
     * 新增：支持解析未显式注册的类（如控制器）
     * @param token 依赖标识
     */
    resolve<T>(token: string | symbol | ControllerType): T {
        // 1. 先检查是否是已注册的依赖
        const item = this.registry.get(token);
        if (item) {
            // 单例模式：缓存实例
            if (item.scope === 'singleton' && item.instance) {
                return item.instance as T;
            }

            // 获取构造函数的依赖并递归解析
            const Constructor = item.useClass;
            const dependencies = this.resolveConstructorDependencies(Constructor);
            const instance = new Constructor(...dependencies);

            // 单例模式：缓存实例
            if (item.scope === 'singleton') {
                item.instance = instance;
            }

            return instance as T;
        }

        // 2. 未注册的类（如控制器）：直接解析构造函数依赖并创建实例
        if (typeof token === 'function') {
            const Constructor = token as new (...args: any[]) => T;
            const dependencies = this.resolveConstructorDependencies(Constructor);
            return new Constructor(...dependencies) as T;
        }

        // 3. 既未注册也不是类：抛出错误
        throw new Error(`依赖未注册: ${token.toString()}`);
    }

    /**
     * 辅助方法：解析构造函数的所有依赖
     */
    private resolveConstructorDependencies<T>(Constructor: new (...args: any[]) => T): any[] {
        // 通过 reflect-metadata 获取构造函数的参数类型
        const paramTypes = Reflect.getMetadata('design:paramtypes', Constructor) || [];
        // 递归解析每个参数的依赖
        return paramTypes.map((dep: any) => this.resolve(dep));
    }

    /**
     * 调试日志：打印注册表内容
     */
    logRegistry(): void {
        console.log('当前注册表内容:', Array.from(this.registry.keys()));
    }
}

// 全局容器实例
export const container = new Container();
