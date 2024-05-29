<template>
  <div class="container">
    <el-menu default-active="1" class="el-menu-vertical-demo" :collapse="isCollapse" @select="handleSelect">
      <el-sub-menu v-for="(menu, index) in menus" :index="index + ''">
        <template #title>
          <el-icon>
            <component :is="menu.icon" />
          </el-icon>
          <span>{{ menu.name }}</span>
        </template>
        <el-menu-item v-for="cmenu in menu.childs" :index="cmenu.path">{{ cmenu.name }} </el-menu-item>
      </el-sub-menu>
    </el-menu>
    <RouterView class="container-r" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterView } from 'vue-router'
import {
  Menu as IconMenu,
  HomeFilled,
  Grid as IconGrid
} from '@element-plus/icons-vue'

const menus = [
  {
    name: 'Part1',
    icon: HomeFilled,
    childs: [
      { name: '轨道控制器', path: '/' },
      { name: "场景", path: "/scene" },
      { name: "透视相机", path: "/perspectiveCamera" },
      { name: "gui", path: "/gui" },
      { name: "纹理", path: "/texture" },
      { name: "位置", path: "/position" },
      { name: "立方纹理", path: "/cubeTexture" },
      { name: "自定义几何体", path: "/bufferGeometry" },
      { name: "自定义UV坐标", path: "/uv" },
      { name: "环境光和点光源", path: "/light" },
      { name: "三维向量", path: "/vector3" },
      { name: "欧拉角", path: "/euler" },
      { name: "gltf加载器", path: "/gltf" },
      { name: "粒子效果", path: "/points" },
      { name: "管道漫游", path: "/roam" }
    ]
  },
  {
    name: "Example",
    icon: IconMenu,
    childs: [
    { name: "粒子效果", path: "/points" },
      { name: "poi点", path: "/poi" },
      { name: "热力图", path: "/heatmap" },
      { name: "星系", path: "/galaxy" },
      { name: "中国地图", path: "/map" },
      { name: "星空背景", path: "/sky" },
      { name: "工厂模型", path: "/factory" },
      { name: "工厂模型2", path: "/factory2" },
      { name: "汽车模型", path: "/car" },
      { name: "汽车", path: "/runCar" },
      { name: "猛龙突进", path: "/dinosaur" },
      { name: "故宫", path: "/city" }
    ]
  }];

const isCollapse = ref(true)
const router = useRouter();
const handleSelect = (key: string, keyPath: string[]) => {
  console.log('key:', key);
  //router.push(key);
  location.replace(location.origin + key);
  //setTimeout(()=>location.reload())
}
</script>

<style scoped lang="less">
.container {
  display: flex;
  height: 100vh;

  &-r {
    flex: 1;
  }
}
</style>
