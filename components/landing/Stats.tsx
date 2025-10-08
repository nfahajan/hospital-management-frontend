import React from "react";

const Stats = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: "50K+", label: "Happy Patients" },
            { value: "200+", label: "Expert Doctors" },
            { value: "15+", label: "Years Experience" },
            { value: "97%", label: "Success Rate" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-bold text-primary md:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
