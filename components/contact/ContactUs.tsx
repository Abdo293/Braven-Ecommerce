import { useLocale } from "next-intl";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { contacts } from "./ContactData";

export const ContactUs = () => {
  const locale = useLocale();
  return (
    <div>
      <div className="container mx-auto max-md:px-3 my-8 grid grid-cols-2 max-md:grid-cols-1 gap-5">
        <Card>
          <form>
            <CardHeader className="font-bold text-2xl pb-4">
              Do You Have Any Questions?
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 max-md:grid-cols-1 gap-3 mb-4">
                <Input type="text" placeholder="Name *" className="!py-5" />
                <Input type="email" placeholder="Email *" className="!py-5" />
              </div>
              <Input
                type="text"
                placeholder="Phone Number *"
                className="py-5"
              />
              <div className="h-full">
                <Textarea
                  placeholder="Message Content *"
                  className="my-4 h-full "
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button className="bg-green-500 hover:bg-green-700 px-8 py-4 cursor-pointer">
                Send
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader className="font-bold text-2xl pb-4">
            Get in touch with us
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {contacts.map((contact, index) => {
                const IconComponent = contact.icon;
                return (
                  <li key={index}>
                    <a
                      href={contact.href}
                      target={
                        contact.platform !== "Email" ? "_blank" : undefined
                      }
                      rel={
                        contact.platform !== "Email"
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className={`flex items-center gap-3 p-3 rounded-lg border border-gray-200 transition-all duration-200 ${contact.bgHover} hover:shadow-md group`}
                    >
                      <div className={`flex-shrink-0 ${contact.color}`}>
                        <IconComponent size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 text-sm mb-1">
                          {contact.platform}
                        </div>
                        <div
                          className={`text-sm ${contact.color} group-hover:underline`}
                        >
                          {contact.text}
                        </div>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
