export const PASSWORD_RESET_MAIL_TEMPLATE = (email: string, token: string) => `<!DOCTYPE html>
<html
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <title></title>
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <!--<![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style type="text/css">
      #outlook a {
        padding: 0;
      }
      body {
        margin: 0;
        padding: 0;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      table,
      td {
        border-collapse: collapse;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      img {
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
        -ms-interpolation-mode: bicubic;
      }
      p {
        display: block;
        margin: 13px 0;
      }
    </style>
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:AllowPNG />
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <!--[if lte mso 11]>
      <style type="text/css">
        .mj-outlook-group-fix {
          width: 100% !important;
        }
      </style>
    <![endif]-->

    <style type="text/css">
      @media only screen and (min-width: 480px) {
        .mj-column-per-100 {
          width: 100% !important;
          max-width: 100%;
        }
      }
    </style>
    <style media="screen and (min-width:480px)">
      .moz-text-html .mj-column-per-100 {
        width: 100% !important;
        max-width: 100%;
      }
    </style>

    <style type="text/css"></style>
    <style type="text/css">
      .hide_on_mobile {
        display: none !important;
      }
      @media only screen and (min-width: 480px) {
        .hide_on_mobile {
          display: block !important;
        }
      }
      .hide_section_on_mobile {
        display: none !important;
      }
      @media only screen and (min-width: 480px) {
        .hide_section_on_mobile {
          display: table !important;
        }

        div.hide_section_on_mobile {
          display: block !important;
        }
      }
      .hide_on_desktop {
        display: block !important;
      }
      @media only screen and (min-width: 480px) {
        .hide_on_desktop {
          display: none !important;
        }
      }
      .hide_section_on_desktop {
        display: table !important;
        width: 100%;
      }
      @media only screen and (min-width: 480px) {
        .hide_section_on_desktop {
          display: none !important;
        }
      }

      p,
      h1,
      h2,
      h3 {
        margin: 0px;
      }

      ul,
      li,
      ol {
        font-size: 11px;
        font-family: Ubuntu, Helvetica, Arial;
      }

      a {
        text-decoration: none;
        color: inherit;
      }

      @media only screen and (max-width: 480px) {
        .mj-column-per-100 {
          width: 100% !important;
          max-width: 100% !important;
        }
        .mj-column-per-100 > .mj-column-per-100 {
          width: 100% !important;
          max-width: 100% !important;
        }
      }

      .mj-column-per-100 [class^="mj-column-per-"] {
        line-height: normal;
      }

      .mj-button-full a {
        display: block !important;
      }
    </style>
  </head>
  <body style="word-spacing: normal; background-color: #ffffff">
    <div style="background-color: #ffffff">
      <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#09090b" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->

      <div
        style="
          background: #09090b;
          background-color: #09090b;
          margin: 0px auto;
          max-width: 600px;
        "
      >
        <table
          align="center"
          border="0"
          cellpadding="0"
          cellspacing="0"
          role="presentation"
          style="background: #09090b; background-color: #09090b; width: 100%"
        >
          <tbody>
            <tr>
              <td
                style="
                  direction: ltr;
                  font-size: 0px;
                  padding: 10px 0px 10px 0px;
                  text-align: center;
                "
              >
                <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->

                <div
                  class="mj-column-per-100 mj-outlook-group-fix"
                  style="
                    font-size: 0px;
                    text-align: left;
                    direction: ltr;
                    display: inline-block;
                    vertical-align: top;
                    width: 100%;
                  "
                >
                  <table
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    role="presentation"
                    style="vertical-align: top"
                    width="100%"
                  >
                    <tbody>
                      <tr>
                        <td
                          align="left"
                          style="
                            font-size: 0px;
                            padding: 15px 15px 15px 15px;
                            word-break: break-word;
                          "
                        >
                          <div
                            style="
                              font-family: Ubuntu, Helvetica, Arial, sans-serif;
                              font-size: 13px;
                              line-height: 1.5;
                              text-align: left;
                              color: #000000;
                            "
                          >
                            <h1
                              style="
                                font-family: Helvetica, Arial, sans-serif;
                                font-size: 22px;
                                font-weight: bold;
                                text-align: center;
                              "
                            >
                              <span style="color: rgb(250, 250, 250)"
                                >Password Reset</span
                              >
                            </h1>
                            <h3
                              style="
                                font-family: Helvetica, Arial, sans-serif;
                                font-size: 13px;
                                font-weight: bold;
                                text-align: center;
                              "
                            >
                              <span style="color: rgb(250, 250, 250)"
                                >r6-strats.com</span
                              >
                            </h3>
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td
                          align="left"
                          style="
                            font-size: 0px;
                            padding: 15px 15px 15px 15px;
                            word-break: break-word;
                          "
                        >
                          <div
                            style="
                              font-family: Ubuntu, Helvetica, Arial, sans-serif;
                              font-size: 13px;
                              line-height: 1.5;
                              text-align: left;
                              color: #000000;
                            "
                          >
                            <p
                              style="
                                font-family: Helvetica, Arial, sans-serif;
                                font-size: 11px;
                              "
                            >
                              <span style="color: rgb(236, 240, 241)"
                                >You requested a password reset. If this request
                                was not send by you, ignore this email.
                                Otherwise click this link to complete the
                                password reset:</span
                              >
                            </p>
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td
                          align="center"
                          vertical-align="middle"
                          style="
                            font-size: 0px;
                            padding: 20px 20px 20px 20px;
                            word-break: break-word;
                          "
                        >
                          <table
                            border="0"
                            cellpadding="0"
                            cellspacing="0"
                            role="presentation"
                            style="border-collapse: separate; line-height: 100%"
                          >
                            <tbody>
                              <tr>
                                <td
                                  align="center"
                                  bgcolor="#29292c"
                                  role="presentation"
                                  style="
                                    border: 1px #49494b solid;
                                    border-radius: 8px;
                                    cursor: auto;
                                    font-style: normal;
                                    mso-padding-alt: 10px 20px 10px 20px;
                                    background: #29292c;
                                  "
                                  valign="middle"
                                >
                                  <a
                                    href="https://r6-strats.com/reset-password/${token}?email=${encodeURIComponent(
                                      email,
                                    )}"
                                    style="
                                      display: inline-block;
                                      background: #29292c;
                                      color: #fafafa;
                                      font-family: Helvetica, Arial, sans-serif;
                                      font-size: 13px;
                                      font-style: normal;
                                      font-weight: normal;
                                      line-height: 100%;
                                      margin: 0;
                                      text-decoration: none;
                                      text-transform: none;
                                      padding: 10px 20px 10px 20px;
                                      mso-padding-alt: 0px;
                                      border-radius: 8px;
                                    "
                                    target="_blank"
                                  >
                                    <span>Reset Password</span>
                                  </a>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>

                      <tr>
                        <td
                          align="left"
                          style="
                            font-size: 0px;
                            padding: 15px 15px 15px 15px;
                            word-break: break-word;
                          "
                        >
                          <div
                            style="
                              font-family: Ubuntu, Helvetica, Arial, sans-serif;
                              font-size: 13px;
                              line-height: 1.5;
                              text-align: left;
                              color: #000000;
                            "
                          >
                            <p
                              style="
                                font-family: Helvetica, Arial, sans-serif;
                                font-size: 11px;
                                text-align: center;
                              "
                            >
                              <span style="color: rgb(119, 119, 121)"
                                >https://r6-strats.com/reset-password/${token}?email=${encodeURIComponent(
                                  email,
                                )}</span
                              >
                            </p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!--[if mso | IE]></td></tr></table><![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!--[if mso | IE]></td></tr></table><![endif]-->
    </div>
  </body>
</html>
`;
