<template>
   <div class="card card-1" @click="goToWikipedia()">
       <img :src="imgUrl" onerror="this.src='https://timedotcom.files.wordpress.com/2015/06/521811839-copy.jpg'"/>
       <div>
           {{title}}
       </div>
       <div >
           {{author}}
       </div>
   </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Book } from '@/Models/Book';
@Component
export default class BookCard extends Vue {
    @Prop(Book) book!: Book;

    get imgUrl() {
        return this.book.imgUri;
    }

    get title() {
        return this.book.title;
    }

    get author() {
        return this.book.author;
    }

    goToWikipedia() {
        window.open(this.book.wikipediaUrl, "_blank");
    }
}
</script>


<style scoped>
.card {
  background: #fff;
  border-radius: 2px;
  display: inline-block;
  height: 400px;
  margin: 1rem;
  position: relative;
  width: 300px;
}

img {
    width: 300px;
    height: 350px;
}

.card-1 {
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  transition: all 0.3s cubic-bezier(.25,.8,.25,1);
}

.card-1:hover {
  box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
}

.card-2 {
  box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
}

.card-3 {
  box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
}

.card-4 {
  box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
}

.card-5 {
  box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);
}

.centerd {
    text-align: center;
}
</style>
