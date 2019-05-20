<template>
  <div class="home">
    <BooksSelector />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import BooksSelector from '@/components/BooksSelector.vue'; // @ is an alias to /src

@Component({
  components: {
    BooksSelector,
  },
})
export default class Home extends Vue {}
</script>
