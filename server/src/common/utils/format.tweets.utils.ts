export class FormatTweets {
    static groupedTweets(tweets) {
        return tweets.reduce((acc, tweetData) => {
            tweetData.tweets.forEach(tweet => {
                const { text } = tweet;
                const { username } = tweet.user;

                const existingUser = acc.find(user => user.username === username);

                if (existingUser) {
                    existingUser.tweets.push(text);
                } else {
                    acc.push({
                        username,
                        tweets: [text]
                    });
                }
            });

            return acc;
        }, []);
    }
}
