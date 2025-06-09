<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.back();
};

const goHome = () => {
  router.replace('/home');
};
</script>

<template>
  <div class="not-found-container">
    <div class="content">
      <van-empty
        image="error"
        description="页面不存在"
      >
        <template #bottom>
          <div class="action-buttons">
            <van-button round type="primary" @click="goBack">返回上一页</van-button>
            <van-button round type="default" @click="goHome">返回首页</van-button>
          </div>
        </template>
      </van-empty>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.not-found-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  
  .content {
    padding: 20px;
    text-align: center;
    
    .action-buttons {
      margin-top: 20px;
      display: flex;
      justify-content: center;
      gap: 12px;
    }
  }
}
</style>
