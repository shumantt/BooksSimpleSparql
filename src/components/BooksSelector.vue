<template>
    <div>
      <div class="form">
        <span>
          Genre:
          <select v-model="genre">
            <option v-for="genreToSelect in genresToSelect" v-bind:key="genreToSelect">
              {{ genreToSelect }}
            </option>
          </select>
        </span>
        <span>
          Author wrote this book when he was:
          <input type="number" v-model="writtenAge" min="17" max="300" :disabled="!includeWrittenAge"/>
        </span>
        <span>
          Filter by written age:
          <input type="checkbox" v-model="includeWrittenAge" />
        </span>
        <span>
          <input type="button" value="Search" @click="findBooks()"/>
        </span>
      </div>
      <div>
        <table class="center">
          <tbody>
              <tr v-for="row in booksData" :key="row.index">
                  <td v-for="book in row" :key="book.index">
                      <BookCard :book="book"/>
                  </td>
              </tr>
          </tbody>
        </table>
      </div>
      
    </div>
</template>

<script lang="ts">
import axios from 'axios';
import { Component, Prop, Vue } from 'vue-property-decorator';
import {DBPediaResponse} from '@/Models/DBPediaResponse';
import BookCard from '@/components/BookCard.vue';
import { Book } from '@/Models/Book';

@Component({
  components: {
    BookCard,
  },
})
export default class BooksSelector extends Vue {
  readonly DBPediaUri : string = "https://dbpedia.org/sparql";
  @Prop() private msg!: string;
  genre: string = 'Any';
  writtenAge: number = 17;
  includeWrittenAge: boolean = false;
  genres: GenreInfo[] = [ new GenreInfo('Any', '')];
  fetchedBooks: Book[] = [];

  mounted() {
    this.fetchGenres();
  }

  get genresToSelect() {
    return this.genres.map(g => g.name);
  }

  get booksData() {
    return this.chunk(this.fetchedBooks, 3);
  }

  fetchGenres() {
    let query = [
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
    "PREFIX dbo: <http://dbpedia.org/ontology/>",
    "PREFIX dbr: <http://dbpedia.org/resource/>",
    "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
    "PREFIX dbp: <http://dbpedia.org/property/>",
    "PREFIX db: <http://dbpedia.org/>",
    "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>",
    "SELECT ?genre ?genreLbl (count(?book) as ?books_count)",
      "WHERE {",
        "?book a dbo:Book;",
          "dbo:literaryGenre ?genre.",
        "?genre rdfs:label ?genreLbl.",
        'FILTER (LANG(?genreLbl) = "en").',
      "}",
    "GROUP BY ?genre ?genreLbl",
    "ORDER BY DESC(?books_count)",
    "LIMIT 30"
    ].join(" ");


    axios.get<DBPediaResponse>(this.DBPediaUri, {
      params: {
        "default-graph-uri": "http://dbpedia.org",
        query: query,
        format: "json"
      }
    })
    .then(response => this.processFetchedGenres(response.data))
    .catch(e => console.log(e));
  }
  processFetchedGenres(fetchedGenres: DBPediaResponse): any {
    console.log(fetchedGenres.results.bindings);
    let genres = fetchedGenres.results.bindings.map(b => {
      return new GenreInfo(b["genreLbl"].value, b["genre"].value);
    });
    genres.unshift(new GenreInfo('Any', ''));
    this.genres = genres;
  }


  findBooks() {
    let filterWrittenAge = '';
    let filterGenre = '';
    if(this.includeWrittenAge)
      filterWrittenAge = `FILTER (?written_age = ${this.writtenAge}).`
    let selectedGener = this.genres.find(g => g.name == this.genre);
    if(selectedGener && selectedGener.name != "Any")
      filterGenre = `FILTER (?genre = <${selectedGener.dbVal}>).`;
    let query = [
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
        "PREFIX dbo: <http://dbpedia.org/ontology/>",
        "PREFIX dbr: <http://dbpedia.org/resource/>",
        "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
        "PREFIX dbp: <http://dbpedia.org/property/>",
        "PREFIX db: <http://dbpedia.org/>",
        "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>",
        "PREFIX prov: <http://www.w3.org/ns/prov#>",
          "SELECT DISTINCT ?bookLabel (SAMPLE(?authorName) as ?authorNamePop) (SAMPLE(?img) as ?imgPop) (SAMPLE(?wikipedia) as ?wikipediaPop) (SAMPLE(?author_img) as ?author_imgPop)",
            "WHERE {",
              "?book a dbo:Book;",
                  "dbo:releaseDate ?releasDate;",
                  "rdfs:label ?bookLabel;",
                  "prov:wasDerivedFrom ?wikipedia;",
                  "dbo:literaryGenre ?genre;",
                  "dbo:author ?author.",
              "?author dbo:birthDate ?birthDate.",
               "?author rdfs:label ?authorName.",
               'OPTIONAL {?book dbo:thumbnail ?img.}',
               'OPTIONAL {?author dbo:thumbnail ?author_img.}',
              "?genre rdfs:label ?genreLbl.",
            'FILTER (REGEX(STR(?birthDate),"[0-9]{4}-[0-9]{2}-[0-9]{2}")).',
            'FILTER (LANG(?genreLbl) = "en").',
            'FILTER (LANG(?bookLabel) = "en").',
            'FILTER (LANG(?authorName) = "en").',
            "BIND ((year(?releasDate) - year(?birthDate)) as ?written_age).",
            filterGenre,
            filterWrittenAge,
          "} GROUP BY ?bookLabel ?written_age ?img ORDER BY DESC(?img) LIMIT 50 ",
    ].join(" ");

    axios.get<DBPediaResponse>(this.DBPediaUri, {
        params: {
          "default-graph-uri": "http://dbpedia.org",
          query: query,
          format: "json"
        }
      })
      .then(response => this.processResponse(response.data))
      .catch(e => console.log(e));
  }

  processResponse(response: DBPediaResponse) {
    console.log(response);
    let books = response.results.bindings.map(b => {
      let title = b["bookLabel"].value;
      let author = b["authorNamePop"].value;
      let img = '';
      if(b["imgPop"]) {
        img = b["imgPop"].value;
      } 
      // else if(b["author_imgPop"]) {
      //   img = b["author_imgPop"].value;
      // }
      let wikipediaUrl = b["wikipediaPop"].value;
      return new Book(title, author, img, wikipediaUrl);
    });
    this.fetchedBooks = books.sort((a,b) => {
      if(a.imgUri)
        return -1;
      if(b.imgUri)
        return 1;
      return 0;
    } );
  }

  private chunk(arr: Book[], chunkSize: number): Book[][] {
      let result = [];
      for (let i=0,len=arr.length; i<len; i+=chunkSize)
          result.push(arr.slice(i,i+chunkSize));
      return result;
  }

}

class GenreInfo {
  constructor(public name: string, public dbVal: string) {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

table.center {
    margin-left:auto; 
    margin-right:auto;
  }

  span {
    margin-left: 10px;
  }
</style>
