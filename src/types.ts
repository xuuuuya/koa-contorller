import { RouterInstance } from '@koa/router';

export type ConstructorType<T = any> = new (...args: any[]) => T;
// 控制器类型
export type ControllerType = new (...args: any[]) => any;
// 服务类型
export type ServiceType = new (...args: any[]) => any;
// DI 作用域类型
export type Scope = 'singleton' | 'transient';

// 依赖注册表项
export interface DependencyItem<T = any> {
    provide: string | symbol | ConstructorType;
    handlerName?: string;
    useClass: ConstructorType;
    scope: Scope;
    instance?: T; // 单例实例缓存
}

// 路由元数据
export interface RouteMetadata {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    handlerName: string;
}

// 控制器元数据
export interface ControllerMetadata {
    prefix: string;
    routes: RouteMetadata[];
}

// 参数类型
export type ParamType = 'QUERY' | 'BODY' | 'PARAM' | 'CTX' | 'NEXT';

// 参数元数据
export interface ParamMetadata {
    index: number;
    type: ParamType;
    key?: string; // 可选，比如 @Query('id') 中的 id
}

// 服务元数据
export interface ServiceMetadata {
    scope: Scope;
}

// 元数据键（避免冲突）
export const METADATA_KEYS = {
    CONTROLLER: Symbol('controller'),
    ROUTES: Symbol('routes'),
    PARAMS: Symbol('params'),
    DEPS: Symbol('dependencies'),
    SERVICE: Symbol('service') // 新增：服务元数据键
};

export interface paramsControlType {
    router?: RouterInstance;
    controllers: ControllerType[];
}
