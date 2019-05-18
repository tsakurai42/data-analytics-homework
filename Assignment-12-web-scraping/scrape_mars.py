from bs4 import BeautifulSoup
import requests
import pandas as pd
from splinter import Browser
import time

def scrape():
        executable_path = {'executable_path': 'chromedriver.exe','headless':True}

        #Pull first article's title, link, paragraph text
        #This section sometimes breaks if the webpage takes too long to load - Not sure how to fix. Rerunning the exact same code usually works.
        url = 'https://mars.nasa.gov/news/?page=0&per_page=40&order=publish_date+desc%2Ccreated_at+desc&search=&category=19%2C165%2C184%2C204&blank_scope=Latest'
        browser = Browser('chrome', **executable_path)#, headless=False)
        browser.visit(url)
        while True:
                html = browser.html
                soup = BeautifulSoup(html,'html.parser')
                
                try:
                        results = soup.select('li.slide')
                        print(results[0])
                        break
                except:
                        time.sleep(1)
        
        title = results[0].select('div.content_title')[0].text
        link = 'https://mars.nasa.gov' + results[0].select('div.content_title a')[0]['href']
        p_text = results[0].select('div.article_teaser_body')[0].text
        print('got nasa.gov article')

        #Pull jpl's "featured image"
        url = 'https://www.jpl.nasa.gov/spaceimages/?search=&category=Mars'
        browser.visit(url)
        html = browser.html
        soup = BeautifulSoup(html,'html.parser')
        results = soup.select('section.main_feature footer a')[0]['data-fancybox-href']
        featured_image_url = f'https://www.jpl.nasa.gov/{results}'
        print('got jpl image')

        #Pull Mars weather twitter latest tweet
        url = 'https://twitter.com/marswxreport?lang=en'
        request = requests.get(url)
        soup = BeautifulSoup(request.text, 'lxml')
        results  = soup.select('.tweet')
        for result in results:
                mars_weather = result.select('div.js-tweet-text-container p.tweet-text')[0].text[:-26].replace('\n',' ')
                #sometimes @MarsWxReport will retweet other accounts and those arent' the weather and since this is supposed to grab the latest Mars weather tweet...
                #Find the first tweet that starts with "InSIght sol" and break the loop.
                #this will break if the tweet's format changes. It used to start with "Sol #### (YYYY-MM-DD)".
                #I could try to ignore retweets, but the twitter account also tweets out announcements.
                if mars_weather[:11] == "InSight sol":
                        break
        #mars_weather = results[0].select('div.js-tweet-text-container p.tweet-text')[0].text[:-26].replace('\n',' ') - old code that only found the first tweet.
        print('got mars weather tweet')

        #Pull space-facts.com mars facts table
        url = 'https://space-facts.com/mars/'
        tables = pd.read_html(url)
        marsfacts_df = tables[0]
        marsfacts_df.columns = ['stat','num']
        print('got marsfacts table')

        #Pull USGS's hemisphere images urls
        url = 'https://astrogeology.usgs.gov/search/results?q=hemisphere+enhanced&k1=target&v1=Mars'
        #browser.visit(url)
        #html = browser.html
        request = requests.get(url)
        soup = BeautifulSoup(request.text,'html.parser')
        results = soup.select('div.item')
        hemi_images = []
        for result in results:
                hemi_link = 'https://astrogeology.usgs.gov/' + result.select('a.itemLink')[0]['href']
                request = requests.get(hemi_link)
                #browser.visit(hemi_link)
                #html = browser.html
                soup2 = BeautifulSoup(request.text,'html.parser')
                image_results = soup2.select('div.downloads a')
                for image_result in image_results:
                        if image_result.text == "Sample":
                                hemi_images.append({'title':result.select('a h3')[0].text,'url':image_result['href']})
                #print(hemi_images)
        print('got hemisphere images')
        browser.quit()

        # print('-'*12)
        # print(BeautifulSoup(requests.get('https://astrogeology.usgs.gov/search/results?q=hemisphere+enhanced&k1=target&v1=Mars').text, 'lxml').select('div.item'))
        # print('-'*12)
        # #make a dictionary with all the previous info
        dict = {'title':title,
                'link':link,
                'text':p_text,
                'jpl_image_url':featured_image_url,
                'mars_weather':mars_weather,
                'mars_facts_table':marsfacts_df.to_html(index=False,header=False),
                'hemisphere_images':hemi_images}
        return dict