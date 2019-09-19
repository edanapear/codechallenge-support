// import uuid from "uuid/v1";
// assume uuid is already on the page
function feedDataModule () {
    function uuid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    const MAX_OLD_ITEMS_COUNT = 5;
    const MAX_GENERATED_FEED_LENGTH = MAX_OLD_ITEMS_COUNT + 3 + 5;
    const GENERATE_INTERVAL = 3000;
    const icons = ["image", "work", "beach"];

    const stubbedData = [
      {
        content: "Some Image",
        icon: "image",
        author: "Danny T",
        date: getDate(0),
        uuid: uuid()
      },
      {
        content: "Some Work",
        icon: "work",
        author: "John S",
        date: getDate(-60000),
        uuid: uuid()
      },
      {
        content: "Some Beach",
        icon: "beach",
        author: "Tyrion L",
        date: getDate(-360000),
        uuid: uuid()
      },
      ...createOldItems(MAX_OLD_ITEMS_COUNT)
    ];

    const feedGenerator = (generateInterval = GENERATE_INTERVAL) => {
      let data = [...stubbedData];
      let newItemCallback = () => {};
      const concatData = items => {
        data = data.concat(items);
      };
      const getData = () => {
        return data;
      };
      const getOlderDataByTimestamp = (timeStamp, count) => {
        let itemCount = 0;
        return data
          .sort((a, b) => b.date - a.date)
          .filter(item => {
            if (+item.date <= +timeStamp && itemCount < count) {
              itemCount++;
              return true;
            } else {
              return false;
            }
          });
      };
      const getNewerDataByTimestamp = timeStamp => {
        return data
          .sort((a, b) => b.date - a.date)
          .filter(item => {
            return +item.date >= +timeStamp;
          });
      };
      const startFeedGenerator = () => createNewItemAtInterval();
      const stopFeedGenerator = intervalProcessId =>
        clearInterval(intervalProcessId);
      const subscribeWithCallback = (timeStamp, callback) => {
        newItemCallback = () => callback(getNewerDataByTimestamp(timeStamp));
      };
      const createNewItemAtInterval = () => {
        const intervalProcessId = setInterval(() => {
          if (data.length >= MAX_GENERATED_FEED_LENGTH) {
            stopFeedGenerator(intervalProcessId);
          }
          concatData(createNewPost());
          console.log("creating new post");
          newItemCallback(data);
        }, generateInterval);
      };

      const unsubscribe = () => stopFeedGenerator();

      return {
        getData,
        getNewerDataByTimestamp,
        getOlderDataByTimestamp,
        startFeedGenerator,
        subscribeWithCallback,
        unsubscribe
      };
    };

    const pseudoLiveFeed = feedGenerator();

    function subscribeToNewFeedPosts(timeStamp, onChangeCallback) {
      pseudoLiveFeed.subscribeWithCallback(timeStamp, onChangeCallback);
      return () => pseudoLiveFeed.unsubscribe();
    }

    function createOldItems(count) {
      const arrayTemplate = new Array(count).fill({});
      const oldItems = arrayTemplate.map((item, i) => {
        const date = getDate(
          // generate random date ~1-8 days prior
          -(i * 1000 * 60 * 60 * Math.random() * 24 * 7) - 1000 * 60 * 60 * 24
        );
        const icon = getRandomFromList(icons);
        return {
          content: `OLD ${icon} post`,
          icon,
          date,
          author: "[autogen]",
          uuid: uuid()
        };
      });
      return oldItems;
    }

    function createNewPost() {
      const date = getDate();
      const icon = getRandomFromList(icons);
      return {
        content: `NEW ${icon} post`,
        icon,
        date,
        author: "[autogen]",
        uuid: uuid()
      };
    }

    function getDate(seconds = 0) {
      const date = new Date();
      return +date + seconds;
    }

    function loadFeedPosts(time, postCountLimit) {
      console.log("postCountLimit", postCountLimit);
      return new Promise((resolve, reject) =>
        resolve(pseudoLiveFeed.getOlderDataByTimestamp(time, postCountLimit))
      );
    }

    function getOlderDataByTimestamp(data, timeStamp, count) {
      let itemCount = 0;
      return data
        .sort((a, b) => b.date - a.date)
        .filter(item => {
          if (+item.date <= +timeStamp && itemCount < count) {
            itemCount++;
            return true;
          } else {
            return false;
          }
        });
    }

    function getPostsByTime(time, postCountLimit) {
      return getOlderDataByTimestamp(stubbedData, time, postCountLimit);
    }

    function getRandomFromList(list) {
      const listLength = list.length;
      return list[Math.floor(Math.random() * listLength)];
    }
    
    return {
      stubbedData,
      getPostsByTime,
      loadFeedPosts,
      pseudoLiveFeed,
      subscribeToNewFeedPosts,
    };

}
window.feedData = feedDataModule();
