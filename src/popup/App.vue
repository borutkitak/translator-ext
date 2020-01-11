<template>
  <div class="languages">
    <div class="language">
      <p>Primary language: </p>
      <select v-model="primary" @change="setLanguage()">
        <option v-for="(language, i) in languages" :key="i" :value="language.language">{{ language.language }}</option>
      </select>
    </div>
    <div class="language">
      <p>Secondary language: </p>
      <select v-model="secondary" @change="setLanguage()">
        <option v-for="(language, i) in languages" :key="i" :value="language.language">{{ language.language }}</option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      languages: [],
      primary: '',
      secondary: ''
    };
  },
  async beforeMount(){
    try {
      const [primary, secondary] =  await this.getLangFromStorage();
      this.primary = primary;
      this.secondary = secondary;
    } catch (error) {
      console.log(error);
    }
  },
  async mounted(){

    const res = await fetch('https://translation.googleapis.com/language/translate/v2/languages?key=AIzaSyDW8fTn6eUuXWVeb0PNyERZHr1CaMwan7c');
    const data = await res.json();
    this.languages = data.data.languages;
  },
  methods: {
    setLanguage(){
      chrome.storage.sync.set({ primary: this.primary, secondary: this.secondary }, function() {
        console.log('Value is set to ', this.primary, this.secondary );
      });
    },
    async getLangFromStorage(detectedLang) {
      const getLang = new Promise(function(resolve, reject){
        chrome.storage.sync.get(['primary', 'secondary'], function(result) {
          console.log(result.primary, result.secondary);
          if(result.primary && result.secondary){
            resolve([result.primary, result.secondary]);
          } else {
            reject(false);
          }
        });
      });
		return await getLang;
	}
  }
};
</script>

<style scoped>
  .languages {
    display: flex;
    flex-direction: column;
    width: 210px;
  }
  .language {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
</style>
