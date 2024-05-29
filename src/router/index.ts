import { createRouter, createWebHistory } from 'vue-router'
import BaseView from '../views/part1/base.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'base',
      component: BaseView
    },
    {
      path: '/scene',
      name: 'scene',
      component: () => import('../views/part1/scene.vue')
    },
    {
      path: '/perspectiveCamera',
      name: 'perspectiveCamera',
      component: () => import('../views/part1/perspectiveCamera.vue')
    },
    {
      path: '/gui',
      name: 'gui',
      component: () => import('../views/part1/gui.vue')
    },
    {
      path: '/texture',
      name: 'texture',
      component: () => import('../views/part1/texture.vue')
    },
    {
      path: '/cubeTexture',
      name: 'cubeTexture',
      component: () => import('../views/part1/cubeTexture.vue')
    },
    {
      path: '/bufferGeometry',
      name: 'bufferGeometry',
      component: () => import('../views/part1/bufferGeometry.vue')
    },
    {
      path: '/uv',
      name: 'uv',
      component: () => import('../views/part1/uv.vue')
    },
    {
      path: '/light',
      name: 'light',
      component: () => import('../views/part1/light.vue')
    },
    {
      path: '/vector3',
      name: 'vector3',
      component: () => import('../views/part1/vector3.vue')
    },
    {
      path: '/euler',
      name: 'euler',
      component: () => import('../views/part1/euler.vue')
    },
    {
      path: '/gltf',
      name: 'gltf',
      component: () => import('../views/part1/gltf.vue')
    },
    {
      path: '/sky',
      name: 'sky',
      component: () => import('../views/eg/sky.vue')
    },
    {
      path: '/map',
      name: 'map',
      component: () => import('../views/eg/map.vue')
    },
    {
      path: '/factory',
      name: 'factory',
      component: () => import('../views/eg/factory/index.vue')
    },
    {
      path: '/factory2',
      name: 'factory2',
      component: () => import('../views/eg/factory/index2.vue')
    },
    {
      path: '/car',
      name: 'car',
      component: () => import('../views/eg/car/index.vue')
    },
    {
      path: '/runCar',
      name: 'runCar',
      component: () => import('../views/eg/car/run.vue')
    },
    {
      path: '/dinosaur',
      name: 'dinosaur',
      component: () => import('../views/eg/dinosaur/index.vue')
    },
    {
      path: '/points',
      name: 'points',
      component: () => import('../views/part1/points.vue')
    },
    {
      path: '/galaxy',
      name: 'galaxy',
      component: () => import('../views/eg/galaxy/index.vue')
    },{
      path:'/poi',
      name:'poi',
      component:()=>import('../views/part3/poi/index.vue')
    },{
      path:'/heatmap',
      name:'heatmap',
      component:()=>import('../views/part3/heatmap/index.vue')
    },{
      path:'/city',
      name:'city',
      component:()=>import('../views/part3/city/index.vue')
    },{
      path:'/position',
      name:'position',
      component:()=>import('../views/part1/position.vue')
    },
    {
      path:'/roam',
      name:'roam',
      component:()=>import('../views/part1/roam.vue')
    }
  ]
})

export default router
