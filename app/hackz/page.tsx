import { headers } from 'next/headers'
import Image from 'next/image'

async function getProjects() {
  const res = await fetch(
    'https://api.airtable.com/v0/appNJwWpcxwIbW89F/Projects?maxRecords=3&view=Grid%20view',
    {
      headers: {
        Authorization: `Bearer ${process.env.AI4E_API_KEY}`,
      },
    }
  )
  return res.json()
}

export default async function HackzPage() {
  const { records } = await getProjects()

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {records.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {project.fields.Screenshot && (
              <div className="relative h-48">
                <Image
                  src={project.fields.Screenshot[0].url}
                  alt={project.fields.Name || 'Project screenshot'}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-1 text-amber-800">
                {project.fields['Project title']}
              </h2>
              {project.fields.By && (
                <p className="text-sm text-gray-500 mb-2">
                  by {project.fields.By}
                </p>
              )}
              {project.fields.Description && (
                <p className="text-gray-600 mb-3 line-clamp-3">
                  {project.fields.Description}
                </p>
              )}
              {project.fields.URL && (
                <a
                  href={project.fields.URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Project →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/*
{
  "records": [
    {
      "id": "recLYKSQfYOe5TS4H",
      "createdTime": "2025-03-04T00:45:53.000Z",
      "fields": {
        "Email(s)": "akrolsmir@gmail.com",
        "By": "Austin Chen",
        "Description": "Use this form to submit your hackathon projects!",
        "Project title": "Hackathon submission form",
        "URL": "https://moxsf.com/submit-hack",
        "Screenshot": [
          {
            "id": "attqt6blWGd35fnas",
            "width": 742,
            "height": 750,
            "url": "https://v5.airtableusercontent.com/v3/u/38/38/1741060800000/v92S0b8fBJe0-EiIEQ12yQ/mSGA7VgKAZJWceMxjPBm99MuhipJozGNxQ0h9xdJlbFM3GNzvBKE8qWdupO-m-CX5viP7r_uqx6U7M7pWpF4kEt3GE92nI3PrJfr3ZZgH4XTQmVzeOhdgqEHNw4QdXUnlW09qIRmNUZNogSV7A-_Ag/bkepbYezZgM-PN2LCRpfnLGC9cgwiG1aE-ZnUBFMDXw",
            "filename": "image.png",
            "size": 68677,
            "type": "image/png",
            "thumbnails": {
              "small": {
                "url": "https://v5.airtableusercontent.com/v3/u/38/38/1741060800000/yvwIleES8S0gSQzxvqnOoA/WjB5PA8tBOH-uIjYHpjtGADRUqzvd0aYsL9eBWQbwz8Gp0uhk00873gmTJ53pIn4dlqKqqMcIVp8sOK6jjhJjbftDgRKkolYN7_hbCjHPEJmPhQfBbwTYgBXVyM2O2tY1BbRTTFhAWQh1YHUqA2x1Q/pe8TRro71nwEu07YogdQ0Hq9IyCujc6hB-n97tXbQWc",
                "width": 36,
                "height": 36
              },
              "large": {
                "url": "https://v5.airtableusercontent.com/v3/u/38/38/1741060800000/7x6-Fesiessb_0dAJycWIw/Pa5pH0YluLg2hdLfCRrcpqj4DzZryz-Pjd9TSdo4oLvqxL6iE9FfOVwSb0WkKU55R5yyols15m9OOFsuYwHDqbd7cyaK7o9YAKJq7Yw8KexjOTRtXC2zaswmj8YRQVIY0eebRdCUF61lSgsV0ZQn5w/ELvgopyle67H_uMHl_Y6y_zTE_KCsPsCQCLISuqAdZo",
                "width": 512,
                "height": 518
              },
              "full": {
                "url": "https://v5.airtableusercontent.com/v3/u/38/38/1741060800000/EK_tZwGJIZdWHJCTsieM8Q/ZzR7x4DuI6mfhNGPfjau-ApoJlcTFa0BnnW9UiYZYDZa7bYkWPLSKySFvK3MhM_4N1Zx30lGCo1ayLkOg50_PCUOrSN7KWrCahwEnbM_yZEOlYluDPD8KEt4zkwRTiud7yFBWUID9cTydHutxEsFmQ/oOXCJSOdFmI9xdgNOgQ4-E34aMpLpPTz17ZdDssUsG4",
                "width": 742,
                "height": 750
              }
            }
          }
        ]
      }
    },
    {
      "id": "reccKMRuacqnMJi3P",
      "createdTime": "2025-03-04T01:13:44.000Z",
      "fields": {
        "Project title": "Question Generator",
        "Description": "This is a browser extension that generates forecasting questions related to the news page you are visiting.",
        "Screenshot": [
          {
            "id": "attBGNv5KUKrpLRWV",
            "width": 2166,
            "height": 1576,
            "url": "https://v5.airtableusercontent.com/v3/u/38/38/1741060800000/B5aGBNN8uDJwd07gSIs8WA/tCm7g7DlTVi7Cn9frv6TooDeag9aPzR1XwYbkGI36Zjs_u684FDh3Lpk2xrhjuC7H3tCIX3UVq9d-etPlcsrdyCVxQ_CHf70j4LKa-wYyRK2uX1e9pG9bEUwz0ONR93itbwVU8Iz0HvKuDj_R0hRcilci1wGnga32Cq8vemi3m9gSmscnsLeGAwLSjUASB3X/vMeCHPs4CaT23N7JhN8X2iQRPZpQQGddLCfJO8ul-ms",
            "filename": "Screenshot 2025-03-03 at 5.12.58 PM.png",
            "size": 678661,
            "type": "image/png",
            "thumbnails": {
              "small": {
                "url": "https://v5.airtableusercontent.com/v3/u/38/38/1741060800000/9fBmIXjKi5p5fgOrGOjqiA/EmhEfYMNNr9fMs3klqDgkr058JO5m1GvDl7RXw_QXzxHZCrC5WMVakTsV7oASJPf6ccYaBQADy7D3qamJXyt7gZxQFK10e4op6ylA76iDg3O6aRDXwR1QXQD6g5UmuO17wBi1u6J2XIvBra_kzHHXw/gIOO-1-1lu_DnPVnDJk7qo9bDwoucCnL5iHfupmAlfw",
                "width": 49,
                "height": 36
              },
              "large": {
                "url": "https://v5.airtableusercontent.com/v3/u/38/38/1741060800000/VA-wc_uwV3lZ4lJp2evlwg/ZJqSQjtBGEuaLS9IzmiJtZAhQfmG97-3uJbAHvNo0Op1eyb430vi2vd8RV70nwbGCQFzUgjtMzC2evCzRJmQ8rQJtB_gYPQXvtuf6DbSNTJvOmSKRI6yuU8wCN2V6FzpwahOTk7KitCgfc1EPytfJg/xFRIPLDx0BLPHXDJGszPZT7vmYXSBGiVtdOeU2nwliA",
                "width": 704,
                "height": 512
              },
              "full": {
                "url": "https://v5.airtableusercontent.com/v3/u/38/38/1741060800000/WOmunZvXvUIQVvcH1x8phg/xuEN5DNMTg9pT81Wqe2I31gFeBwdIyyaAigi7xlyoqwxJ9Pn0ZbSrZ52YQ2iTh6ZBga1vP-ps3Qz4aPuzdwQ8cuJ4_5M7i3_ZsgsZ9TQ6_7fvTJ9eH3vL7PlAvodBSdnpzYSu7zWHUovlVGZU8Na6Q/Hn5n0J5m6bn-OSd3F5cPIYq4-kloo_qJCR4RcVGlImc",
                "width": 2166,
                "height": 1576
              }
            }
          }
        ],
        "By": "Gustavo Lacerda",
        "Email(s)": "gustavo.lacerda@gmail.com"
      }
    }
  ]
}
*/
