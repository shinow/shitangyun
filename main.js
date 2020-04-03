import devtools from '@vue/devtools'
import Vue from 'vue'
import App from './App'

import store from './store'

import Request from '@/utils/request'

import router from './router'
import {
    RouterMount
} from 'uni-simple-router'

import moment from 'moment'

import Vconsole from 'vconsole'

// 引入调试工具
if(process.env.NODE_ENV === 'development') {
    devtools.connect('192.168.0.144')
    
    const vConsole = new Vconsole()
    Vue.use(vConsole)
}

// 使用中文时间
moment.locale('zh-cn')
// 全局使用moment
Vue.prototype.$moment = moment

const http = new Request()

const httpForm = new Request()

http.setConfig((config) => { /* 设置全局配置 */
    config.baseUrl = ''
    return config
})

/* config 为默认全局配置*/
httpForm.setConfig((config) => {
    config.baseUrl = ''
    config.header = {
        'content-type': 'application/x-www-form-urlencoded'
    }
    return config
})

Vue.prototype.$store = store

Vue.prototype.$http = http

Vue.prototype.$httpForm = httpForm

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
    store,
    ...App
})
//v1.3.5起 H5端 你应该去除原有的app.$mount();使用路由自带的渲染方式
// #ifdef H5
RouterMount(app, '#app')
// #endif

// #ifndef H5
app.$mount() //为了兼容小程序及app端必须这样写才有效果
// #endif
