import { categories } from './subjects/categories.js';
import { locations } from './locations/africa_countries.js';
const URLs = {
    async getURLs ( ){
        // const suject = 'Biocoop';
        const links = [];
		const obj = {};
		obj[ 'location' ]   = "Williamstown--NJ--08094";
		obj[ 'link' ]       = "https://www.byblack.us/search/Williamstown--NJ--08094/businesses/?page=1&per_page=5&query=&search_type=fuzzy";
		links.push( obj );
		return links;
    }
}
export { URLs };





