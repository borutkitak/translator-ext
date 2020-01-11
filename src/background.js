global.browser = require('webextension-polyfill');

const apiKey = '';
let translationType;

chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		"id": "dictionary",
		"title": "Translate",
		"contexts": ["selection"]
	});
});

chrome.contextMenus.onClicked.addListener(async (details) => {
	const selectionText = details.selectionText;
	translate(selectionText);
});

chrome.runtime.onMessage.addListener(async (request, sender) => {
	if(request.translate){
		translate(request.translate);
	}
});

chrome.commands.onCommand.addListener(function(command) {
	if (command === 'translate') {
		try {
			chrome.tabs.executeScript({ code: "window.getSelection().toString();"}, selection => {
				translate(selection[0]);
			});
		} catch (error) {
			console.log(error);
		}
	}
});

const translate = async (text) => {
	const translated = await getTranslation(text.toLowerCase());
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { translated });
	});
};

const getLangFromStorage = async (detectedLang) => {
	const getLang = new Promise(function(resolve, reject){
		chrome.storage.sync.get(['primary', 'secondary'], function(result) {
			if(result.primary && result.secondary){
				if(detectedLang === result.primary){
					translationType = 'TO_SECONDARY';
					resolve(result.secondary);
				} else if(detectedLang === result.secondary){
					translationType = 'TO_PRIMARY';
					resolve(result.primary);
				} else {
					translationType = 'TO_PRIMARY';
					resolve(result.primary);
				}
			}
		});
	});
	return await getLang;
}


//detect selected text language
const detectLanguage = async (text) => {
	const result = await fetch('https://translation.googleapis.com/language/translate/v2/detect?key='+apiKey, {
		method: 'POST',
		body: JSON.stringify({ q: text })
	});
	const data = await result.json();
	return data.data.detections[0][0].language;
};

async function getTranslation(text) {
	const detectedLang = await detectLanguage(text);
	const translateTo = await getLangFromStorage(detectedLang);

	const data = {
		"q": text,
		"source": detectedLang,
		"target": translateTo,
		"format": "text"
	};

	//'https://script.google.com/macros/s/AKfycbyUS-cKSLyEotUr8d4i8SLiBtDR2ewAfGT65nQoKDasTU97-w/exec'
	const result = await fetch('https://translation.googleapis.com/language/translate/v2?key=AIzaSyDW8fTn6eUuXWVeb0PNyERZHr1CaMwan7c', {
		method: 'POST',
		body: JSON.stringify(data)
	});
	const da = await result.json();

	if(text === da.data.translations[0].translatedText) return;

	const translated = {
		original: text,
		translated: da.data.translations[0].translatedText,
		change: translationType === 'TO_PRIMARY' ? false : true
	};

	chrome.notifications.create('', {
		title: '',
		message: `${translated.original} -> ${translated.translated}`,
		iconUrl: '/icons/icon_128.png',
		type: 'basic',
		buttons: [
			{
			title: "Yes, get me there"
			},
			{
				title: "Yes, get me there2"
			}
		]
	});
	return translated;
}
