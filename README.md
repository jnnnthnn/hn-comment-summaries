# Hacker News comment thread summarizer extension

## What is this?

Summarizes individual HN comments within their thread's context, allowing you to skim Hacker News (news.ycombinator.com) comment threads faster.

![screenshot.png](screenshot.png)

Uses an API key provided by the user.

Your API key is stored on your machine. Requests are made directly from browser tabs showing Hacker News threads.

In principle, a malicious third-party extension could spy on those and steal your API key. Additionally, even though we use a very cheap model, we haven't built in cost controls. You're advised to use [OpenAI's project usage limits](https://help.openai.com/en/articles/9186755-managing-your-work-in-the-api-platform-with-projects#h_d2c8f84ece) as spend guardrails.
  
In our testing, reading a dozen or so HN posts a day resulted in about $0.02 in OpenAI usage costs (as of August 2024).

## How to contribute

Just open a PR! I threw this together in less than an hour, and would very much welcome improvements :)
